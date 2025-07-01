import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/webgame.css";

export default function WebGameSelector() {
  const nav = useNavigate();

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
