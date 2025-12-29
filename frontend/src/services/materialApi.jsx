import api from "./axios"; 

export const uploadMaterial = async (formData) => {
  try {
    const response = await api.post("/materials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Upload failed" };
  }
};

export const getMaterials = async (category = "notes") => {
  try {
    const response = await api.get(`/materials?category=${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch materials" };
  }
};

export const generateSummary = async (materialId, mode, topic = "") => {
  try {
    const payload = { mode, topic };
    const response = await api.post(`/materials/${materialId}/summarize`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Generation failed" };
  }
};
