// Updated AuthService.js
import axios from "axios";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('shopId');
      localStorage.removeItem('branchId');
      localStorage.removeItem('shopName');
      localStorage.removeItem('branchName');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleResponse = async (response) => {
  if (response.status >= 200 && response.status < 300) {
    return { data: response.data };
  } else {
    return { error: response.data.message };
  }
};

const AuthService = {
  adminLogin: async (shopName, password) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/admin/login`,
        {
          shopName,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(response);
      
      if (response.status >= 200 && response.status < 300) {
        const { shopId, userId, token } = response.data;
        
        // Store token in localStorage
        if (token) {
          localStorage.setItem('authToken', token);
        }
        
        // Store user data
        localStorage.setItem('userId', userId || shopId);
        localStorage.setItem('shopId', shopId || response.data._id);
        localStorage.setItem('shopName', shopName);
        
        // Set default authorization header for future requests
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return { 
          data: {
            ...response.data,
            shopId: shopId || response.data._id,
            userId: userId || shopId
          } 
        };
      }
      return handleResponse(response);
    } catch (error) {
      console.error('Admin login error:', error);
      return { error: error.response?.data?.message || "Login failed" };
    }
  },

  managerLogin: async (name, password, shopName, branch) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/manager/login`,
        {
          username: name,
          password,
          shopName,
          branchName: branch,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const { shopId, branchId, userId, token } = response.data;
        
        // Store token and data
        if (token) {
          localStorage.setItem('authToken', token);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        localStorage.setItem('userId', userId || response.data._id);
        localStorage.setItem('shopId', shopId);
        localStorage.setItem('branchId', branchId);
        localStorage.setItem('shopName', shopName);
        localStorage.setItem('branchName', branch);
        
        return { 
          data: {
            ...response.data,
            shopId: shopId,
            branchId: branchId,
            userId: userId || response.data._id
          } 
        };
      }
      return handleResponse(response);
    } catch (error) {
      console.error('Manager login error:', error);
      return { error: error.response?.data?.message || "Login failed" };
    }
  },

  cashierLogin: async (name, password, shopName, branch) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/cashier/login`,
        {
          username: name,
          password,
          shopName,
          branchName: branch,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const { token } = response.data;
        
        if (token) {
          localStorage.setItem('authToken', token);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Cashier login error:', error);
      return { error: error.response?.data?.message || "Login failed" };
    }
  },

  kitchenLogin: async (name, password, shopName, branch) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/kitchen/login`,
        {
          username: name,
          password,
          shopName,
          branchName: branch,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const { shopId, branchId, userId, token } = response.data;
        
        if (token) {
          localStorage.setItem('authToken', token);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return { 
          data: {
            ...response.data,
            shopId: shopId,
            branchId: branchId,
            userId: userId || response.data._id
          } 
        };
      }
      return handleResponse(response);
    } catch (error) {
      console.error('Kitchen login error:', error);
      return { error: error.response?.data?.message || "Login failed" };
    }
  },

  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('shopId');
      localStorage.removeItem('branchId');
      localStorage.removeItem('shopName');
      localStorage.removeItem('branchName');
      
      // Clear axios default header
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Still call server logout to clear server-side session/cookie
      const response = await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error.response?.data?.message || "Logout failed" };
    }
  },

  getShopNames: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/shops`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },

  getBranches: async (shopName) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/auth/branches/${shopName}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },
};

// Initialize token on app load
const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Call this when your app starts
initializeAuth();

export default AuthService;
export { axiosInstance };
