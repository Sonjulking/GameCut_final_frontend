import axios from "../lib/axiosInstance";

// 유저 정보 조회 API
export const fetchUserInfo = () => {
  return axios.get("/user/myinfo", {
    withCredentials: true,
  });
};

// 아이템 목록 조회 API
export const fetchItemList = () => axios.get("/items");

// 아이템 구매 API
export const buyItemApi = (itemNo) => axios.post(`/items/buy?itemNo=${itemNo}`);

// 아이템 업로드 API
export const uploadItemApi = (itemDTO, file) => {
  const formData = new FormData();
  formData.append(
    "item",
    new Blob([JSON.stringify(itemDTO)], { type: "application/json" })
  );
  formData.append("file", file);
  return axios.post("/items/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
