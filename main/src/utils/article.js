import sanitizeHtml from 'sanitize-html';
import { decodeHTML } from 'entities';
export function sanitizeArticle(html) {
  return sanitizeHtml(String(html || ''), {
    allowedTags: ['p','br','strong','b','em','i','u','s','h2','h3','h4','ul','ol','li','blockquote','a','img','figure','figcaption','hr','table','thead','tbody','tr','th','td'],
    allowedAttributes: { a: ['href','title'], img: ['src','alt','title'], td: ['colspan','rowspan'], th: ['colspan','rowspan'] },
    allowedSchemes: ['http','https','mailto'], allowedSchemesByTag: { img: ['https'] }, allowProtocolRelative: false,
  });
}
export function articleText(html, length = 160) {
  const spaced = String(html || '').replace(/<\/(?:p|div|h[1-6]|li)>|<br\s*\/?>/gi, '$& ');
  const text = decodeHTML(sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > length ? characters.slice(0, length).join('').trimEnd() + '…' : text;
}
