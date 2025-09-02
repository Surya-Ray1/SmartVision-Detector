// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // comes from your .env file
});

// Get recent detections
export const listDetections = (limit = 20) =>
  api.get(`/detections`, { params: { limit } }).then((r) => r.data);

// Save a detection (with optional image)
export const saveDetection = (payload, imageFile) => {
  const form = new FormData();
  form.append('source', payload.source || 'camera');
  form.append('results', JSON.stringify(payload.results));
  if (imageFile) form.append('image', imageFile);

  return api
    .post(`/detections`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export default api;
