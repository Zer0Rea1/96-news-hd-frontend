import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5173/', pretendToBeVisual: true,
});

for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'DOMParser', 'FormData', 'MouseEvent', 'Event']) {
  Object.defineProperty(globalThis, name, { value: name === 'window' ? dom.window : dom.window[name], configurable: true, writable: true });
}
window.scrollTo = () => {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
