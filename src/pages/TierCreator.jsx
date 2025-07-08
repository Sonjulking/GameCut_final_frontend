// src/pages/TierCreator.jsx
// 2025년 7월 8일 수정됨 - 게임 종류 선택 기능 추가
import React, { useState } from "react";
import axiosInstance from "../lib/axiosInstance"; // 2025년 7월 8일 수정됨 - axiosInstance로 수정

// 게임별 티어 시스템 정의
const GAME_TIER_SYSTEMS = {
  롤: [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "그랜드마스터",
    "챌린저",
  ],
  발로란트: [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "초월",
    "불멸",
    "레디언트",
  ],
  배그: ["브론즈", "실버", "골드", "플래티넘", "다이아몬드", "마스터"],
  오버워치: [
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "그랜드마스터",
  ],
  애이펙스: [
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "프레데터",
  ],
};

const GAME_TYPES = Object.keys(GAME_TIER_SYSTEMS);

export function TierCreator({ onDone }) {
  const [files, setFiles] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState("");
  const [tierMap, setTierMap] = useState({});

  // 게임 종류 변경 시 티어 매핑 초기화
  const handleGameTypeChange = (gameType) => {
    setSelectedGameType(gameType);
    setTierMap({}); // 기존 티어 매핑 초기화
  };

  // 선택된 게임의 티어 목록 가져오기
  const getAvailableTiers = () => {
    return selectedGameType ? GAME_TIER_SYSTEMS[selectedGameType] : [];
  };

  const createGame = async () => {
    if (!selectedGameType) {
      alert("게임 종류를 선택해주세요.");
      return;
    }

    try {
      const form = new FormData();
      // attach all files
      files.forEach((f) => form.append("files", f));
      // attach corresponding tiers
      files.forEach((_, i) => form.append("tiers", tierMap[i]));
      // attach game type
      form.append("gameType", selectedGameType);

      // 2025년 7월 8일 수정됨 - Content-Type 헤더 제거 (axios가 자동으로 설정하도록)
      console.log("게임 생성 요청 시작:", {
        selectedGameType,
        filesCount: files.length,
      });

      const res = await axiosInstance.post("/game/create", form);

      console.log("게임 생성 결과:", res.data);
      alert(`${selectedGameType} 게임이 성공적으로 생성되었습니다!`);
      onDone();
    } catch (err) {
      console.error("게임 생성 실패:", err);
      console.error("상세 오류:", err.response?.data);
      console.error("상태 코드:", err.response?.status);
      alert(
        `게임 생성 중 오류가 발생했습니다: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-4">새 게임 생성</h3>

      {/* 2025년 7월 8일 수정됨 - 게임 종류 선택 추가 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">게임 종류 선택</label>
        <select
          value={selectedGameType}
          onChange={(e) => handleGameTypeChange(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white"
        >
          <option value="" disabled>
            게임을 선택하세요
          </option>
          {GAME_TYPES.map((gameType) => (
            <option key={gameType} value={gameType}>
              {gameType}
            </option>
          ))}
        </select>
      </div>

      {/* 파일 업로드 - 게임 선택 후에만 활성화 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          동영상 파일 선택
        </label>
        <input
          type="file"
          multiple
          accept="video/*"
          disabled={!selectedGameType}
          onChange={(e) => {
            setFiles(Array.from(e.target.files));
            setTierMap({});
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {!selectedGameType && (
          <p className="text-sm text-gray-500 mt-1">
            먼저 게임 종류를 선택해주세요
          </p>
        )}
      </div>

      {/* 파일별 티어 설정 */}
      {selectedGameType && files.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium">
            각 영상의 티어를 선택하세요 ({selectedGameType})
          </h4>
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded"
            >
              <span className="flex-1 truncate text-sm">{file.name}</span>
              <select
                value={tierMap[idx] || ""}
                onChange={(e) =>
                  setTierMap((m) => ({ ...m, [idx]: e.target.value }))
                }
                className="border rounded px-2 py-1 text-sm min-w-24"
              >
                <option value="" disabled>
                  티어 선택
                </option>
                {getAvailableTiers().map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex space-x-2">
        <button
          onClick={createGame}
          disabled={
            !selectedGameType ||
            files.length === 0 ||
            Object.keys(tierMap).length !== files.length ||
            Object.values(tierMap).some((tier) => !tier)
          }
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          게임 생성
        </button>
        <button
          onClick={onDone}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
        >
          취소
        </button>
      </div>
    </div>
  );
}
