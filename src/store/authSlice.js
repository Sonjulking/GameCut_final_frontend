// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  user: null, // 전체 유저 정보 저장
  isAuthChecking: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startAuthCheck(state) {
      state.isAuthChecking = true;
    },
    loginSuccess(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload; // ex: { userId, userName, nickname, email, ... }
      state.isAuthChecking = false; // ✅ 인증 확인 완료
    },

    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.isAuthChecking = false; // ✅ 인증 확인 완료
    },
  },
});

export const { loginSuccess, logout, startAuthCheck } = authSlice.actions;
export default authSlice.reducer;
