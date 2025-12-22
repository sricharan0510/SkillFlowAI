import api from './axios';

export const uploadMaterial = (formData) => {
  return api.post("/materials/upload", formData);
};
