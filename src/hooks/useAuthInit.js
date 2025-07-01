// src/hooks/useAuthInit.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/authSlice";
import axios from "../lib/axiosInstance";

const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await axios.get("/user/myinfo"); // ✅ accessToken 쿠키 기반 요청
        dispatch(loginSuccess(res.data)); // ✅ 유저 전체 정보 저장
        console.log("✅ 로그인 상태 복원됨:", res.data);
      } catch (err) {
        console.log("❌ 로그인 복원 실패:", err.response?.status);
        dispatch(logout());
      }
    };

    restoreUser();
  }, [dispatch]);
};

export default useAuthInit;
