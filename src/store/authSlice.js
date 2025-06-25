import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  userId: null,
  nickname: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { token, userId, nickname } = action.payload;
      state.isLoggedIn = true;
      state.token = token;
      state.userId = userId;
      state.nickname = nickname;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.userId = null;
      state.nickname = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
