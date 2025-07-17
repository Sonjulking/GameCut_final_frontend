import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/webgame.css";
import { useSelector } from "react-redux";

export default function WebGameSelector() {
  const nav = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      nav("/login");
    }
  }, [isLoggedIn, nav]);
  return (
    <div className="webgame-container selector-container">
      <h1 className="selector-title">웹게임 선택</h1>
      <div className="selector-buttons">
        <button
          onClick={() => nav("/webgame/tournament")}
          className="selector-button selector-button--green"
        >
          이상형 월드컵
        </button>
        <button
          onClick={() => nav("/webgame/guess-rank")}
          className="selector-button selector-button--blue"
        >
          티어 맞추기
        </button>
      </div>
    </div>
  );
}
