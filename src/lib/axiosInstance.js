// 2025-07-12 생성됨
// src/lib/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";
import store from "../store/store";
import { logout } from "../store/authSlice";

const axiosInstance = axios.create({
  // baseURL 제거하고 상대 경로로 설정
  // baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true, // ⭐ 쿠키 자동 포함
});

// 요청 인터셉터: accessToken 쿠키에서 읽어 Authorization 헤더 설정
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    console.log(' 토큰 확인:', token); // 디버깅용
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' Authorization 헤더 설정:', config.headers.Authorization); // 디버깅용
    } else {
      console.log('토큰이 없음!'); // 디버깅용
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 발생 시 토큰 갱신 시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // accessToken이 만료됐고, 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "/api/user/refresh",
          {},
          { withCredentials: true }
        );

        const { token } = res.data;

        // 새 accessToken을 쿠키에 저장
        Cookies.set("accessToken", token, {
          path: "/",
          sameSite: "Lax",
          secure: false, // 배포 환경에서는 true
        });

        // Authorization 헤더 갱신 후 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료 → 로그아웃 처리
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
