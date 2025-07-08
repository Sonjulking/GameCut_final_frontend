import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchItemList,
  buyItemApi,
  uploadItemApi,
  deleteItemApi, // ✅ 삭제 API 추가
} from "../store/itemApi";

// 아이템 목록 조회
export const fetchItems = createAsyncThunk("item/fetchItems", async () => {
  const res = await fetchItemList();
  return res.data;
});

// 아이템 구매
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

// 아이템 업로드
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

// ✅ 아이템 삭제
export const deleteItem = createAsyncThunk(
  "item/deleteItem",
  async (itemNo, { rejectWithValue }) => {
    try {
      const res = await deleteItemApi(itemNo);
      return itemNo; // 삭제된 itemNo 반환
    } catch (e) {
      return rejectWithValue(e.response?.data || "삭제 오류");
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
      // 목록 조회
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

      // 업로드
      .addCase(uploadItem.fulfilled, (state, action) => {
        state.lastUploadResult = action.payload;
      })
      .addCase(uploadItem.rejected, (state, action) => {
        state.lastUploadResult = action.payload;
      })

      // 구매
      .addCase(buyItem.fulfilled, (state, action) => {
        state.lastBuyResult = action.payload;
      })
      .addCase(buyItem.rejected, (state, action) => {
        state.lastBuyResult = action.payload;
      })

      // ✅ 삭제
      .addCase(deleteItem.fulfilled, (state, action) => {
        const deletedItemNo = action.payload;
        state.itemList = state.itemList.filter(
          (item) => item.itemNo !== deletedItemNo
        );
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default itemSlice.reducer;
