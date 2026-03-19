import api from "./api";

const aiService = {
  generateProductDescription: async (payload) => {
    const response = await api.post("/ai/generate-product-description", payload);
    return response.data;
  },
};

export default aiService;
