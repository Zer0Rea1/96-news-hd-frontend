import api from './apis'

export const getPost = async () => {
    try {
      const response = await api.get('/api/getpost');
     
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response?.data?.message || 'Failed to fetch posts');
      }
      return response.data; 
    } catch (error) {
      console.error('API Error:', error.response || error.message || error);
      throw new Error(error.message || 'Error in getting posts');
    }
  };
  
  