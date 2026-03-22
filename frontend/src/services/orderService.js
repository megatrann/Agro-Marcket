import api from "./api";

const orderService = {
  createOrder: async () => {
    const response = await api.post("/orders/create");
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await api.get("/orders/seller-orders");
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/update-status/${id}`, { status });
    return response.data;
  },
};

export default orderService;
