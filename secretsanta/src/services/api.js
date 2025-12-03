import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee API
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  getByCode: async (code) => {
    const response = await api.get(`/employees/code/${encodeURIComponent(code)}`);
    return response.data;
  },
  create: async (employeeCode, name) => {
    const response = await api.post('/employees', { employeeCode, name });
    return response.data;
  },
  delete: async (code) => {
    const response = await api.delete(`/employees/${encodeURIComponent(code)}`);
    return response.data;
  },
};

// Assignment API
export const assignmentAPI = {
  getAll: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },
  create: async (giverCode, receiverCode) => {
    const response = await api.post('/assignments', { giverCode, receiverCode });
    return response.data;
  },
  reset: async () => {
    const response = await api.delete('/assignments');
    return response.data;
  },
  getAvailable: async (giverCode) => {
    const response = await api.get(`/assignments/available/${encodeURIComponent(giverCode)}`);
    return response.data;
  },
  getByEmployeeCode: async (employeeCode) => {
    const response = await api.get(`/assignments/by-code/${encodeURIComponent(employeeCode)}`);
    return response.data;
  },
};

export default api;

