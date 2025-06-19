// src/hooks/useAuthInit.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice"; // 경로 확인

const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const nickname = localStorage.getItem("nickname");

    if (token && userId && nickname) {
      dispatch(loginSuccess({ token, userId, nickname }));
    }
  }, [dispatch]);
};

export default useAuthInit;
