'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
export default function ShareArticle({ url }) {
  const [state, setState] = useState('');
  async function copy() { try { await navigator.clipboard.writeText(url); setState('copied'); } catch { setState('failed'); } }
  return <><button type="button" className="copy-button" onClick={copy}>{state === 'copied' ? <Check size={16} /> : <Copy size={16} />}{state === 'copied' ? 'لنک کاپی ہو گیا' : 'لنک کاپی کریں'}</button><span className="sr-only" role="status">{state === 'copied' ? 'لنک کاپی ہو گیا' : ''}</span>{state === 'failed' && <p role="alert" className="copy-error">لنک کاپی نہیں ہو سکا۔ براہ کرم براؤزر سے لنک کاپی کریں۔</p>}</>;
}
