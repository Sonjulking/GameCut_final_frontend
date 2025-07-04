// src/pages/TierCreator.jsx
import React, { useState } from "react";
import api from "../lib/axiosInstance";

const TIERS = ["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아"];

export function TierCreator({ onDone }) {
  const [files, setFiles] = useState([]);
  const [tierMap, setTierMap] = useState({});

  const createGame = async () => {
    try {
      const form = new FormData();
      // attach all files
      files.forEach((f) => form.append("files", f));
      // attach corresponding tiers
      files.forEach((_, i) => form.append("tiers", tierMap[i]));

      // one-shot game-create call
      const res = await api.post("/game/create", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("게임 생성 결과:", res.data);
      alert("게임이 성공적으로 생성되었습니다!");
      onDone();
    } catch (err) {
      console.error("게임 생성 실패:", err);
      alert("게임 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-4">새 게임 생성</h3>

      <input
        type="file"
        multiple
        accept="video/*"
        onChange={(e) => {
          setFiles(Array.from(e.target.files));
          setTierMap({});
        }}
        className="block mb-4"
      />

      <div className="space-y-2">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <span className="flex-1 truncate">{file.name}</span>
            <select
              value={tierMap[idx] || ""}
              onChange={(e) =>
                setTierMap((m) => ({ ...m, [idx]: e.target.value }))
              }
              className="border rounded px-2 py-1"
            >
              <option value="" disabled>
                티어 선택
              </option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-2">
        <button
          onClick={createGame}
          disabled={
            files.length === 0 || Object.keys(tierMap).length !== files.length
          }
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
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
