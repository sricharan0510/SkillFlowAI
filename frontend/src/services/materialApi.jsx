import api from "./axios";

export const uploadMaterial = (formData) => {
  return api.post("/materials/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
