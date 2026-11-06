import DOMPurify from 'dompurify';

export function sanitizeArticle(html) {
  return DOMPurify.sanitize(String(html || ''), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'colspan', 'rowspan'],
  });
}

export function articleText(html, length = 160) {
  const spaced = String(html || '').replace(/<\/(?:p|div|h[1-6]|li)>|<br\s*\/?>/gi, '$& ');
  const fragment = DOMPurify.sanitize(spaced, {
    ALLOWED_TAGS: [], ALLOWED_ATTR: [], RETURN_DOM_FRAGMENT: true,
  });
  const text = fragment.textContent.replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > length ? characters.slice(0, length).join('').trimEnd() + '…' : text;
}
