import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserInfo } from "../store/itemApi";

// 비동기 요청
export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
  const res = await fetchUserInfo();
  console.log("백엔드 응답:", res.data);
  return res.data;
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: {
      userNickname: "",
      userPoint: 0,
    },
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
