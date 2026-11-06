'use client';
export default function ErrorPage({ reset }) { return <div className="news-container paused-page" role="alert"><h1>خبریں لوڈ نہیں ہو سکیں</h1><p>براہ کرم دوبارہ کوشش کریں۔</p><button type="button" className="news-button" onClick={reset}>دوبارہ کوشش کریں</button></div>; }
