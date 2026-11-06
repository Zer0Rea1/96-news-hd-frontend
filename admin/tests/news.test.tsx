import { afterEach, expect, test } from 'bun:test';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import NewsWorkspace, { NewsTags } from '../src/components/NewsWorkspace';
import { cleanNews, newsInput } from '../src/news-domain';
const tag = { id: '12345678-1234-4234-8234-123456789012', name: 'پاکستان', slug: 'pakistan' };
const article = { id: 'news-1', slug: 'خبر-fixed', title: 'اہم خبر', article: '<p>تفصیلات</p>', thumbnailImage: 'https://res.cloudinary.com/test/image/upload/v1/96news/posts/a.webp', tags: [tag], status: 'published', version: 7 };
let root: Root | undefined;
const originalFetch = globalThis.fetch;
Object.assign(HTMLDialogElement.prototype, { showModal(this: HTMLDialogElement) { this.setAttribute('open', ''); }, close(this: HTMLDialogElement) { this.removeAttribute('open'); } });
async function mount(tags = false) { const div = document.createElement('div'); document.body.append(div); root = createRoot(div); await act(async () => { root!.render(tags ? <NewsTags /> : <NewsWorkspace />); }); }
function button(name: string) { const b = [...document.querySelectorAll('button')].find(b => b.textContent === name); if (!b) throw new Error('Missing button ' + name); return b; }
async function click(b: HTMLElement) { await act(async () => b.click()); }
async function wait(check: () => boolean) { for (let n=0;n<100;n++) { if(check()) return; await act(async () => { await new Promise(r=>setTimeout(r,5)); }); } throw new Error('Expected UI state missing'); }
function mock(handler?: (path: string, options: RequestInit) => Response) { globalThis.fetch = (async (input: RequestInfo | URL, options: RequestInit = {}) => { const path=String(input); if(options.method) return handler?.(path,options) || Response.json({}); if(path.includes('/tags')) return Response.json({tags:[tag]}); return Response.json({posts:[article],totalCount:1}); }) as typeof fetch; }
afterEach(async () => { if(root) await act(async()=>root!.unmount()); root=undefined; document.body.innerHTML=''; globalThis.fetch=originalFetch; });
test('article validation preserves Urdu formatting and strips executable HTML', () => {
 const clean=cleanNews('<p onclick="x()"><strong>اردو</strong><script>alert(1)</script><a href="javascript:alert(1)">لنک</a></p>');
 expect(clean).toContain('<strong>اردو</strong>'); expect(clean).not.toMatch(/onclick|script|javascript:/);
 expect(newsInput.safeParse({...article,tags:[],article:'<p><br></p>'}).success).toBe(false);
 expect(newsInput.safeParse({...article,tags:[tag.id],article:clean}).success).toBe(true);
});
test('editing sends the loaded version and preserves content on conflict', async () => {
 let payload: any;
 mock((_path, options) => { payload=JSON.parse(String(options.body)); return Response.json({error:'This article changed. Reload before saving.'},{status:409}); });
 await mount(); await wait(()=>Boolean(document.querySelector('[aria-label="Edit اہم خبر"]')));
 await click(document.querySelector('[aria-label="Edit اہم خبر"]') as HTMLElement);
 await click(button('Update article'));
 await wait(()=>document.body.textContent!.includes('Reload before saving'));
 expect(payload.version).toBe(7); expect(payload.tags).toEqual([tag.id]); expect(payload.article).toBe('<p>تفصیلات</p>');
 expect(document.querySelector('dialog')).not.toBeNull();
});
test('deleting requires confirmation and sends If-Match', async () => {
 let deleted=false;
 mock((_path, options) => { expect(options.method).toBe('DELETE'); expect(new Headers(options.headers).get('If-Match')).toBe('7'); expect(JSON.parse(String(options.body))).toEqual({version:7}); deleted=true; return new Response(null,{status:204}); });
 await mount(); await wait(()=>Boolean(document.querySelector('[aria-label="Delete اہم خبر"]')));
 await click(document.querySelector('[aria-label="Delete اہم خبر"]') as HTMLElement); expect(deleted).toBe(false);
 await click(button('Delete article')); expect(deleted).toBe(true); await wait(()=>!document.querySelector('dialog'));
});
test('new article saves a draft with uploaded thumbnail and selected tags', async () => {
 let saved: any;
 mock((_path, options) => { saved=JSON.parse(String(options.body)); return Response.json({post:article},{status:201}); });
 await mount(); await wait(()=>!document.body.textContent!.includes('Loading articles'));
 await click(button('New article'));
 const title=document.querySelector('dialog input:not([type])') as HTMLInputElement;
 await act(async()=>{ Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!.call(title,'نئی خبر'); title.dispatchEvent(new Event('input',{bubbles:true})); });
 const editor=document.querySelector('[contenteditable]') as HTMLElement; editor.innerHTML='<p>نئی تفصیلات</p>';
 await click(document.querySelector('dialog input[type=checkbox]') as HTMLElement);
 // Image upload is tested through the API response without writing to production.
 const file=document.querySelector('input[type=file]') as HTMLInputElement;
 const before=globalThis.fetch;
 globalThis.fetch=(async(input:any,options:any)=>String(input).endsWith('/photos')?Response.json({url:article.thumbnailImage}):before(input,options)) as typeof fetch;
 Object.defineProperty(file,'files',{value:[new window.File(['image'],'news.webp',{type:'image/webp'})],configurable:true});
 await act(async()=>file.dispatchEvent(new Event('change',{bubbles:true})));
 await wait(()=>Boolean(document.querySelector('.news-thumbnail')));
 await click(button('Save draft')); await wait(()=>Boolean(saved));
 expect(saved.status).toBe('draft'); expect(saved.title).toBe('نئی خبر'); expect(saved.version).toBeUndefined();
});
test('tag rename uses the existing ID and preserves its URL', async () => {
 let payload: any, path=''; mock((p, options)=>{path=p;payload=JSON.parse(String(options.body));return Response.json({tag});});
 await mount(true); await wait(()=>Boolean(document.querySelector('tbody tr'))); await click(button('Rename'));
 const input=document.querySelector('form input') as HTMLInputElement;
 await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!.call(input,'نیا نام');input.dispatchEvent(new Event('input',{bubbles:true}));});
 await act(async()=>document.querySelector('form')!.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await wait(()=>Boolean(payload)); expect(path).toBe('/api/admin/news/tags/'+tag.id);expect(payload).toEqual({name:'نیا نام'});
});
