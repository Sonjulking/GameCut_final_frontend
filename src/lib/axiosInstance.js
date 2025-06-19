import axios from "axios";
import store from "../store/store"; // ✅ 상위 폴더로 이동
import { loginSuccess, logout } from "../store/authSlice";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true, // ⭐ 쿠키 포함 필수
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // access token 만료
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );
        const { token } = res.data;
        store.dispatch(loginSuccess({ token }));

        // 새 토큰으로 Authorization 헤더 재설정 후 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
