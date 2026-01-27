

import axios from 'axios';
// export const API_URL = 'http://localhost:8000/api';
// export const API_URL = 'http://178.154.252.145/api';
export const API_URL = 'https://api.w9999.app/api';
// export const API_URL = 'https://duolingopocketserver.onrender.com/api';


const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


$api.interceptors.request.use((config)=>{
    config.headers.Authorization = `Bearear ${localStorage.getItem('token')}`
    return config;
});

export default $api;

