import { configureStore, createSlice } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // authSlice는 따로 파일로 생성해야 함

// 기존 test 슬라이스 유지
const test = createSlice({
  name: "test",
  initialState: [
    { id: 0, name: "White and Black", count: 2 },
    { id: 2, name: "Grey Yordan", count: 1 },
  ],
  reducers: {
    setTest(state, action) {
      state.name = action.payload;
    },
  },
});

export const { setTest } = test.actions;

// ✅ 여러 슬라이스 등록
export default configureStore({
  reducer: {
    test: test.reducer,
    auth: authReducer, // 추가된 로그인 관련 슬라이스
  },
});
