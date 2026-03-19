import api from "./api";

const productService = {
  getProducts: async (filters = {}) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (payload) => {
    const response = await api.post("/products", payload);
    return response.data;
  },
};

export default productService;
