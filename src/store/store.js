// store.js - Redux Persist 설정 적용
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./authSlice"; // authSlice는 따로 파일로 생성해야 함

import itemReducer from "./itemSlice";
import userReducer from "./userSlice";

// 기존 test 슬라이스 유지 (그대로)
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

// ✅ 새로 추가: persist 설정
const persistConfig = {
  key: "gamecut-root", // 고유한 키 (프로젝트명)
  storage, // localStorage 사용
  whitelist: ["auth"], // auth slice만 저장 (test는 저장 안함)
};

// ✅ 새로 추가: reducers를 하나로 결합
const rootReducer = combineReducers({
  test: test.reducer,
  auth: authReducer,
  item: itemReducer,
  user: userReducer,
});

// ✅ 새로 추가: persist가 적용된 reducer 생성
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ 수정: configureStore를 persistedReducer로 변경
const store = configureStore({
  reducer: persistedReducer, // 기존 객체 형태에서 persistedReducer로 변경
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persist에서 사용하는 액션들을 무시
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// ✅ 새로 추가: persistor 생성 및 export
export const persistor = persistStore(store);

// ✅ 기존과 동일: store export (default 추가)
export default store;
