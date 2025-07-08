import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const useAutoLogout = (timeout = 600000) => {
  // 기본: 10분
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const timerRef = useRef(null);

  // ⏱ 로그아웃 타이머 초기화
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch(logout());
      alert("10분 이상 활동이 없어 자동 로그아웃되었습니다.");
      window.location.href = "/login";
    }, timeout);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    // 🖱 사용자 활동 감지 이벤트
    const events = ["click", "mousemove", "keydown", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // ⏱ 첫 타이머 시작
    resetTimer();

    return () => {
      // 🧹 언마운트 시 이벤트 제거 및 타이머 정리
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn]);
};

export default useAutoLogout;
