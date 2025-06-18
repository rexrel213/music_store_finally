import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ruslik.taruman.ru',  // всегда обращаемся к backend на localhost:8000
});

export default api;
