import axios from 'axios';

const api = axios.create({
  baseURL: `https://96-news-hd-backend.netlify.app`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;