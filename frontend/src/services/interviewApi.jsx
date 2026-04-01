import api from "./axios";

export const startInterviewSession = async (payload) => {
  try {
    const response = await api.post("/interviews/start", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to start interview" };
  }
};

export const submitInterviewAnswer = async (payload) => {
  try {
    const response = await api.post("/interviews/answer", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit answer" };
  }
};

export const finishInterviewSession = async (sessionId) => {
  try {
    const response = await api.post("/interviews/finish", { sessionId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to finish interview" };
  }
};

export const getUserInterviews = async () => {
  try {
    const response = await api.get("/interviews");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch interviews" };
  }
};

export const getInterview = async (id) => {
  try {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch interview" };
  }
};