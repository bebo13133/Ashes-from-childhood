const requester = async (method, url, data) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available (for future admin functionality)
  const token = localStorage.getItem('adminToken');
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Handle different status codes
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      throw new Error('Unauthorized access');
    }

    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();

  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const requestFactory = () => {
  return {
    get: (url) => requester('GET', url),
    post: (url, data) => requester('POST', url, data),
    put: (url, data) => requester('PUT', url, data),
    patch: (url, data) => requester('PATCH', url, data),
    del: (url) => requester('DELETE', url),
  };
};
