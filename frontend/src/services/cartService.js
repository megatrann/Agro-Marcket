import api from "./api";

const cartService = {
  addToCart: async (payload) => {
    const response = await api.post("/cart/add", payload);
    return response.data;
  },

  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  updateCartItem: async (id, quantity) => {
    const response = await api.put(`/cart/update/${id}`, { quantity });
    return response.data;
  },

  removeCartItem: async (id) => {
    const response = await api.delete(`/cart/remove/${id}`);
    return response.data;
  },
};

export default cartService;
