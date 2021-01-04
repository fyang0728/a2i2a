import axios from 'axios';
import { ApiResponse } from '../utils/utils';

export const getApiSource = (apiPath: string) => {
  return axios.get<ApiResponse[]>(apiPath);
};
