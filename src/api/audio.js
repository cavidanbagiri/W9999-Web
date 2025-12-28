import $api from "../http/api";

export const generateSpeech = async (data) => {
  if (!data.text) {
    return null;
  }
  const response = await $api.post(`/words/voice`, data, {
    responseType: 'blob'
  });
  return response.data; // Returns the Blob
};