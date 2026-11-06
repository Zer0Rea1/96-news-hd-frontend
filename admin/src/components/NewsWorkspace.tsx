import { useEffect, useRef, useState } from 'react';
import { Plus, PencilSimple, Trash, ArrowSquareOut } from '@phosphor-icons/react';
import { request } from '../api';
import { cleanNews, newsInput, type NewsPost, type NewsTag } from '../news-domain';
import { ErrorMessage } from './common';
import Dialog from './Dialog';

function NewsEditor({ post, tags, onClose, onSaved }: { post: NewsPost | null; tags: NewsTag[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(post?.title || '');
  const [image, setImage] = useState(post?.thumbnailImage || '');
  const [selected, setSelected] = useState(post?.tags.map(t => t.id) || []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editor.current) editor.current.innerHTML = cleanNews(post?.article || ''); }, [post]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function close() { if (!busy && !uploading && (!dirty || window.confirm('Discard the unsaved changes?'))) onClose(); }
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) { setError('Choose a JPG, PNG, or WebP under 4 MB.'); return; }
    setUploading(true); setError('');
    try { const body = new FormData(); body.append('photo', file); const result = await request<{ url: string }>('/admin/news/photos', { method: 'POST', body }); setImage(result.url); setDirty(true); }
    catch (e) { setError((e as Error).message); } finally { setUploading(false); }
  }
  async function save(status: 'draft' | 'published') {
    setError('');
    const parsed = newsInput.safeParse({ title, article: editor.current?.innerHTML || '', thumbnailImage: image, tags: selected, status });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Check the article details.'); return; }
    setBusy(true);
    try {
      await request('/admin/news/posts' + (post ? '/' + encodeURIComponent(post.id) : ''), { method: post ? 'PUT' : 'POST', body: JSON.stringify({ ...parsed.data, ...(post ? { version: post.version } : {}) }) });
      setDirty(false); onSaved();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  // shortcut: native editing commands preserve selection/undo; replace when collaborative editing is needed.
  function format(command: string, value?: string) { editor.current?.focus(); document.execCommand(command, false, value); setDirty(true); }
  return <Dialog label={post ? 'Edit article' : 'New article'} wide onClose={close}>
    <div className="news-editor"><div className="news-heading"><h2>{post ? 'Edit article' : 'New article'}</h2><button type="button" className="button secondary compact" disabled={busy || uploading} onClick={close}>Close</button></div>
      <fieldset disabled={busy || uploading} className="news-fields">
        <label className="field">Headline<input dir="auto" maxLength={500} value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }} /></label>
        <div className="field"><label htmlFor="article-body">Article</label><div className="editor-toolbar" role="toolbar" aria-label="Article formatting">{[['Bold','bold'],['Italic','italic'],['Bullets','insertUnorderedList'],['Numbered list','insertOrderedList'],['Paragraph','formatBlock','p'],['Heading','formatBlock','h2'],['Undo','undo']].map(([label, command, value]) => <button type="button" key={label} onMouseDown={e => e.preventDefault()} onClick={() => format(command!, value)}>{label}</button>)}</div>
          <div id="article-body" ref={editor} className="article-editor" contentEditable={!busy && !uploading} suppressContentEditableWarning role="textbox" aria-label="Article" aria-multiline="true" dir="auto" onInput={() => setDirty(true)} onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); setDirty(true); }} /></div>
        <label className="field">Thumbnail<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /><span className="muted">JPG, PNG, or WebP · up to 4 MB</span></label>
        {image && <img className="news-thumbnail" src={image} alt="Article thumbnail" />}
        <fieldset className="tag-choices"><legend>Tags <span className="muted">{selected.length}/10</span></legend>{tags.map(tag => <label key={tag.id}><input type="checkbox" checked={selected.includes(tag.id)} disabled={!selected.includes(tag.id) && selected.length >= 10} onChange={e => { setSelected(e.target.checked ? [...selected, tag.id] : selected.filter(id => id !== tag.id)); setDirty(true); }} /><span dir="auto">{tag.name}</span></label>)}{!tags.length && <p>Create a tag before saving an article.</p>}</fieldset>
      </fieldset>
      {post && <p className="muted">The article URL stays the same when you change its headline.</p>}
      <ErrorMessage message={error} /><div className="news-actions"><button type="button" className="button secondary" disabled={busy || uploading || !tags.length} onClick={() => void save('draft')}>{post?.status === 'published' ? 'Move to drafts' : 'Save draft'}</button><button type="button" className="button primary" disabled={busy || uploading || !tags.length} onClick={() => void save('published')}>{busy ? 'Saving…' : post?.status === 'published' ? 'Update article' : 'Publish article'}</button></div>
    </div>
  </Dialog>;
}

export default function NewsWorkspace() {
  const [posts, setPosts] = useState<NewsPost[]>([]), [tags, setTags] = useState<NewsTag[]>([]);
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [tag, setTag] = useState(''), [page, setPage] = useState(0), [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<NewsPost | null | undefined>(), [deleting, setDeleting] = useState<NewsPost | null>(null), [busy, setBusy] = useState(false), [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    const params = new URLSearchParams({ skip: String(page * 10), limit: '10' }); if (search) params.set('query', search); if (tag) params.set('tag', tag);
    Promise.all([request<{ posts: NewsPost[]; totalCount: number }>('/admin/news/posts?' + params, { signal: controller.signal }), request<{ tags: NewsTag[] }>('/admin/news/tags', { signal: controller.signal })]).then(([data, labels]) => { if (!controller.signal.aborted) { setPosts(data.posts); setTotal(data.totalCount); setTags(labels.tags); } }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, search, tag, revision]);
  async function remove() {
    if (!deleting) return; setBusy(true); setDeleteError('');
    try { await request('/admin/news/posts/' + encodeURIComponent(deleting.id), { method: 'DELETE', headers: { 'If-Match': String(deleting.version) }, body: JSON.stringify({ version: deleting.version }) }); setDeleting(null); setRevision(v => v + 1); if (posts.length === 1 && page) setPage(page - 1); }
    catch (e) { setDeleteError((e as Error).message); } finally { setBusy(false); }
  }
  return <section aria-label="News management"><div className="page-heading"><div><h1>News</h1><p>Write, edit, and publish articles.</p></div><button className="button primary" onClick={() => setEditing(null)}><Plus size={18} />New article</button></div>
    <div className="news-filters"><form onSubmit={e => { e.preventDefault(); setSearch(query.trim()); setPage(0); }}><label className="field">Search headlines<input maxLength={100} value={query} dir="auto" onChange={e => setQuery(e.target.value)} /></label><button className="button secondary" type="submit">Search</button></form><label className="field">Tag<select value={tag} onChange={e => { setTag(e.target.value); setPage(0); }}><option value="">All tags</option>{tags.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}</select></label></div>
    <ErrorMessage message={error} />{error ? <button className="button secondary" onClick={() => setRevision(v => v + 1)}>Retry</button> : loading ? <p role="status" className="loading">Loading articles…</p> : !posts.length ? <div className="empty-state"><h2>{search || tag ? 'No matching articles' : 'No articles yet'}</h2><p>{search || tag ? 'Change your search or tag filter.' : 'Create an article and save it as a draft or publish it.'}</p></div> : <div className="directory-panel"><div className="table-scroll"><table><thead><tr><th>Headline</th><th>Status</th><th>Tags</th><th>Actions</th></tr></thead><tbody>{posts.map(post => <tr key={post.id}><td className="news-title" dir="auto">{post.title}</td><td><span className={'news-status ' + post.status}>{post.status === 'published' ? 'Published' : 'Draft'}</span></td><td><div className="news-tag-list">{post.tags.map(t => <span key={t.id} dir="auto">{t.name}</span>)}</div></td><td><div className="news-actions"><button className="icon-button" aria-label={'Edit ' + post.title} onClick={() => setEditing(post)}><PencilSimple size={19} /></button>{post.status === 'published' && <a className="icon-button" aria-label={'View ' + post.title} href={'https://www.96newshd.com/news/' + encodeURIComponent(post.slug)} target="_blank" rel="noreferrer"><ArrowSquareOut size={19} /></a>}<button className="icon-button" aria-label={'Delete ' + post.title} onClick={() => { setDeleting(post); setDeleteError(''); }}><Trash size={19} /></button></div></td></tr>)}</tbody></table></div></div>}
    {!error && <div className="table-footer"><span>{total} articles</span><div><button className="button secondary compact" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1}</span><button className="button secondary compact" disabled={loading || (page + 1) * 10 >= total} onClick={() => setPage(page + 1)}>Next</button></div></div>}
    {editing !== undefined && <NewsEditor post={editing} tags={tags} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); setRevision(v => v + 1); }} />}
    {deleting && <Dialog label="Delete article" onClose={() => { if (!busy) setDeleting(null); }}><div className="news-editor"><h2>Delete article?</h2><p dir="auto">{deleting.title}</p><p>This permanently deletes the article and its public link.</p><ErrorMessage message={deleteError} /><div className="news-actions"><button className="button secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className="button danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Deleting…' : 'Delete article'}</button></div></div></Dialog>}
  </section>;
}

export function NewsTags() {
  const [tags, setTags] = useState<NewsTag[]>([]), [name, setName] = useState(''), [selected, setSelected] = useState<NewsTag | null>(null), [remove, setRemove] = useState<NewsTag | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  useEffect(() => { const controller = new AbortController(); setLoading(true); setError(''); request<{ tags: NewsTag[] }>('/admin/news/tags', { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setTags(result.tags); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [revision]);
  async function save(e: React.FormEvent) { e.preventDefault(); if (!name.trim()) return; setBusy(true); setError(''); try { await request('/admin/news/tags' + (selected ? '/' + selected.id : ''), { method: selected ? 'PUT' : 'POST', body: JSON.stringify({ name: name.trim() }) }); setSelected(null); setName(''); setRevision(v => v + 1); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function destroy() { if (!remove) return; setBusy(true); setError(''); try { await request('/admin/news/tags/' + remove.id, { method: 'DELETE' }); setRemove(null); if (selected?.id === remove.id) { setSelected(null); setName(''); } setRevision(v => v + 1); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <section aria-label="Tag management"><div className="page-heading"><div><h1>Tags</h1><p>Label articles by topic. Each article can have up to 10 tags.</p></div></div><ErrorMessage message={error} />{error && !loading && <button className="button secondary" onClick={() => setRevision(v => v + 1)}>Retry loading tags</button>}<form className="news-filters" onSubmit={save}><label className="field">{selected ? 'Tag name' : 'New tag'}<input required maxLength={80} dir="auto" value={name} disabled={busy} onChange={e => setName(e.target.value)} /></label><button className="button primary" disabled={busy}>{busy ? 'Saving…' : selected ? 'Save name' : 'Create tag'}</button>{selected && <button className="button secondary" type="button" disabled={busy} onClick={() => { setSelected(null); setName(''); }}>Cancel</button>}</form>{loading ? <p role="status">Loading tags…</p> : <div className="directory-panel table-scroll"><table><thead><tr><th>Name</th><th>Articles</th><th>Actions</th></tr></thead><tbody>{tags.map(t => <tr key={t.id}><td dir="auto">{t.name}</td><td>{t.post_count || 0}</td><td><div className="news-actions"><button className="button secondary compact" disabled={busy} onClick={() => { setSelected(t); setName(t.name); }}>Rename</button><button className="button secondary compact" disabled={busy || Boolean(t.legacy_category)} title={t.legacy_category ? 'Retained for existing topic links' : undefined} onClick={() => { setRemove(t); setError(''); }}>Delete</button></div></td></tr>)}</tbody></table>{!tags.length && <p className="empty-state">No tags yet.</p>}</div>}
    {remove && <Dialog label="Delete tag" onClose={() => { if (!busy) setRemove(null); }}><div className="news-editor"><h2>Delete tag?</h2><p dir="auto">{remove.name}</p><p>Articles will remain, but this tag will be removed from them.</p><ErrorMessage message={error} /><div className="news-actions"><button className="button secondary" disabled={busy} onClick={() => setRemove(null)}>Cancel</button><button className="button danger" disabled={busy} onClick={() => void destroy()}>Delete tag</button></div></div></Dialog>}
  </section>;
}
