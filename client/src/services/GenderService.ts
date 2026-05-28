import AxiosInstance from './AxiosInstance';

const GenderService = {
  loadGenders: async () => AxiosInstance.get('/gender/loadGenders'),
};

export default GenderService;