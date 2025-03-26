// utils/auth.js
export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
  
    try {
      const response = await axios.post('/api/auth/refresh-token', { refreshToken });
      const { token } = response.data;
  
      // Save the new token
      localStorage.setItem('token', token);
  
      return token;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      throw err;
    }
  };
  
  // Example: Intercept requests to refresh the token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const newToken = await refreshToken();
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (err) {
          console.error('Failed to refresh token:', err);
          // Redirect to login page
          window.location.href = '/portal/login';
        }
      }
  
      return Promise.reject(error);
    }
  );