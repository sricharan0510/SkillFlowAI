import api from "./axios";

export const generateExam = async (materialId, config) => {
  try {
    const response = await api.post("/exams/generate", { materialId, config });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Exam generation failed" };
  }
};

export const getExam = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exam" };
  }
};

export const getExamWithAnswers = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/answers`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exam" };
  }
};

export const getUserExams = async () => {
  try {
    const response = await api.get("/exams");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exams" };
  }
};

export const saveExamResult = async (examId, resultData) => {
  try {
    const response = await api.post(`/exams/${examId}/result`, resultData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to save exam result" };
  }
};

export const retakeExam = async (examId) => {
  try {
    const response = await api.post(`/exams/${examId}/retake`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create retake exam" };
  }
};