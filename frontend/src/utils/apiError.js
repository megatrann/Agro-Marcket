export const getApiErrorMessage = (error, fallbackMessage) => {
  if (!error) {
    return fallbackMessage;
  }

  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  return error.response?.data?.message || fallbackMessage;
};
