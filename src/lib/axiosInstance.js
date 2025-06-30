import axios from "axios";
import Cookies from "js-cookie";
import store from "../store/store";
import { loginSuccess, logout } from "../store/authSlice";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true, // ⭐ 쿠키 자동 포함
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken"); // ✅ 쿠키에서 accessToken 읽기
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:8081/user/refresh", // ✅ 백엔드 토큰 재발급
          {},
          { withCredentials: true }
        );

        const { token } = res.data;

        // ✅ accessToken을 쿠키에 저장
        Cookies.set("accessToken", token, {
          path: "/",
          sameSite: "Lax",
        });

        store.dispatch(loginSuccess({ token }));

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
