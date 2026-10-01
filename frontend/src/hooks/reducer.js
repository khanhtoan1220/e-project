const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      };
    case "SET_NOTIFICATION":
      return {
        ...state,
        notification: action.payload
      };
    default:
      return state;
  }
};

export default reducer;