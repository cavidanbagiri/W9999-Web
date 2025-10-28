import $api from "../http/api";

export const generateSpeech = async (data) => {
  console.log('data is ', data);
  if (!data.text) {
    return null;
  }
  const response = await $api.post(`/words/voice`, data, {
    responseType: 'blob'
  });
  return response.data; // Returns the Blob
};