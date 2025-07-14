import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance.js";
import "../styles/RankingsPage.css";

const RankingsPage = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("monthly");

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const endpoint =
          mode === "monthly" ? "/api/ranking/monthly" : "/api/ranking/total";

        const response = await axiosInstance.get(endpoint);
        const data = response.data;

        if (Array.isArray(data)) {
          setRankings(data);
        } else {
          console.warn("⚠️ 서버 응답이 배열이 아닙니다:", data);
          setRankings([]);
        }

        console.log("✅ 응답:", data, "isArray:", Array.isArray(data));
      } catch (error) {
        console.error("❌ 랭킹 불러오기 실패", error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [mode]);

  const handleModeChange = (newMode) => {
    if (newMode !== mode) setMode(newMode);
  };

  return (
    <div className="rankings-container">
      <h2>
        {" "}
        {mode === "monthly" ? "전월 시즌 포인트 랭킹" : "전체 누적 포인트 랭킹"}
      </h2>

      <div className="ranking-buttons">
        <button
          className={mode === "monthly" ? "active" : ""}
          onClick={() => handleModeChange("monthly")}
        >
          전월 랭킹
        </button>
        <button
          className={mode === "total" ? "active" : ""}
          onClick={() => handleModeChange("total")}
        >
          전체 랭킹
        </button>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : rankings.length === 0 ? (
        <p>랭킹 데이터가 없습니다.</p>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>닉네임</th>
              <th>포인트</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((user, index) => (
              <tr key={user.userNo}>
                <td>{index + 1}</td>
                <td>{user.nickname}</td>
                <td>{user.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RankingsPage;
