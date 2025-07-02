import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchItemList, buyItemApi, uploadItemApi } from "../store/itemApi";

export const fetchItems = createAsyncThunk("item/fetchItems", async () => {
  const res = await fetchItemList();
  return res.data;
});

export const buyItem = createAsyncThunk(
  "item/buyItem",
  async ({ itemNo, userName }, { rejectWithValue }) => {
    try {
      const res = await buyItemApi(itemNo);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || "구매 오류");
    }
  }
);

export const uploadItem = createAsyncThunk(
  "item/uploadItem",
  async ({ itemDTO, file }, { rejectWithValue }) => {
    try {
      const res = await uploadItemApi(itemDTO, file);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || "업로드 오류");
    }
  }
);

const itemSlice = createSlice({
  name: "item",
  initialState: {
    itemList: [],
    loading: false,
    error: null,
    lastUploadResult: null,
    lastBuyResult: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.itemList = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 업로드, 구매에 대한 처리
      .addCase(uploadItem.fulfilled, (state, action) => {
        state.lastUploadResult = action.payload;
      })
      .addCase(uploadItem.rejected, (state, action) => {
        state.lastUploadResult = action.payload;
      })
      .addCase(buyItem.fulfilled, (state, action) => {
        state.lastBuyResult = action.payload;
      })
      .addCase(buyItem.rejected, (state, action) => {
        state.lastBuyResult = action.payload;
      });
  },
});

export default itemSlice.reducer;
