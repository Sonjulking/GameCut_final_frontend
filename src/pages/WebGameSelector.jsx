import React from "react";
import { useNavigate } from "react-router-dom";

export default function WebGameSelector() {
  const nav = useNavigate();

  return (
    <div className="flex h-screen bg-black text-white items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">웹게임 선택</h1>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => nav("/webgame/tournament")}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Game 1: 이상형 월드컵
          </button>
          <button
            onClick={() => nav("/webgame/guess-rank")}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Game 2: 티어 맞추기
          </button>
        </div>
      </div>
    </div>
  );
}
