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
};

export default orderService;
