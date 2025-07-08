import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout, startAuthCheck } from "../store/authSlice";
import axios from "../lib/axiosInstance";

const useAuthInit = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const restoreUser = async () => {
      // ✅ localStorage에서 복원된 상태가 있으면 서버 확인 시작
      if (isLoggedIn) {
        dispatch(startAuthCheck()); // 인증 확인 중 상태로 변경
      }

      try {
        const res = await axios.get("/user/myinfo");
        dispatch(loginSuccess(res.data));
        console.log("✅ 로그인 상태 복원됨:", res.data);
      } catch (err) {
        console.log("❌ 로그인 복원 실패:", err.response?.status);
        dispatch(logout());
      }
    };

    // 쿠키에 토큰이 있을 때만 서버 확인
    if (document.cookie.includes("accessToken=")) {
      restoreUser();
    } else {
      // 쿠키가 없으면 즉시 로그아웃
      dispatch(logout());
      a;
    }
  }, [dispatch, isLoggedIn]);
};

export default useAuthInit;
