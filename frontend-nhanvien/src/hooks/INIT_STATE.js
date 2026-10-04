const savedUser = localStorage.getItem("staff_user");

export const STATE = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
};
