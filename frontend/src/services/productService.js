import api from "./api";

const productService = {
  getProducts: async (filters = {}) => {
    const response = await api.get("/products", { params: filters });

    if (!response?.data || typeof response.data !== "object" || !Array.isArray(response.data.products)) {
      throw new Error("Invalid products API response. Check VITE_API_URL configuration.");
    }

    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get("/products/mine");
    return response.data;
  },

  createProduct: async (payload) => {
    // Now expects payload.images to be an array of Cloudinary URLs
    const response = await api.post("/products", payload);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
