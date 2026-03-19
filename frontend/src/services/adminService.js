import api from "./api";

const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get("/admin/products");
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get("/admin/orders");
    return response.data;
  },

  updateOrder: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}`, { status });
    return response.data;
  },

  getAnalyticsOverview: async () => {
    const response = await api.get("/analytics/overview");
    return response.data;
  },

  getSalesByCategory: async () => {
    const response = await api.get("/analytics/sales-by-category");
    return response.data;
  },

  getTopProductsAnalytics: async () => {
    const response = await api.get("/analytics/top-products");
    return response.data;
  },

  getTopFarmersAnalytics: async () => {
    const response = await api.get("/analytics/top-farmers");
    return response.data;
  },

  getLocationDemandAnalytics: async () => {
    const response = await api.get("/analytics/location-demand");
    return response.data;
  },
};

export default adminService;
