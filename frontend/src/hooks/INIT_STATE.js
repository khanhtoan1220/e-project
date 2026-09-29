const savedUser = localStorage.getItem("user");

export const STATE = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  loading: false,
  notification: null
};