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
        const res = await axios.get("/user/myinfo"); // ✅ accessToken 쿠키 기반으로 요청
        const { userId, userNickname, userNo } = res.data;
        dispatch(loginSuccess({ userId, nickname: userNickname }));
        console.log("✅ 로그인 상태 복원됨:", userId, userNickname, userNo);
      } catch (err) {
        console.log("❌ 로그인 복원 실패:", err.response?.status);
        dispatch(logout());
      }
    };

    restoreUser();
  }, [dispatch]);
};

export default useAuthInit;
