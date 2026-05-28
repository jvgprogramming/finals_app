import AxiosInstance from './AxiosInstance';

const AuthService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await AxiosInstance.post('/auth/login', credentials);
    return response;
  },

  logout: async () => {
    const response = await AxiosInstance.post('/auth/logout');
    return response;
  },

  me: async () => {
    const response = await AxiosInstance.get('/auth/me');
    return response;
  },
};

export default AuthService;
