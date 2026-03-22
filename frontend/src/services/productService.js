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
    const imageFiles = Array.isArray(payload.imageFiles) ? payload.imageFiles : [];

    if (imageFiles.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      if (payload.subcategory) {
        formData.append("subcategory", payload.subcategory);
      }
      formData.append("organic", String(payload.organic));
      formData.append("retailPrice", String(payload.retailPrice));
      formData.append("wholesalePrice", String(payload.wholesalePrice));
      formData.append("minWholesaleQty", String(payload.minWholesaleQty));
      formData.append("quantity", String(payload.quantity));
      formData.append("location", payload.location);

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post("/products", payload);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
