import { useCallback, useEffect, useState } from 'react';
import { getPost } from '../api/postblog.api.js';

export default function useNews(limit = 30) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getPost({ limit }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setNews(data.posts); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [limit, attempt]);

  return { news, loading, error, retry };
}
