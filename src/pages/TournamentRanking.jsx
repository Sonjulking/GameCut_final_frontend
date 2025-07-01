import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/webgame.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function TournamentRanking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${VITE_API_URL}/api/worldcup/ranking`)
      .then((res) => {
        const adapted = res.data.map((r) => {
          const raw = r.videoRealPath.replace(/\\/g, "/");
          const m = raw.match(/upload\/.*/);
          // encode special chars
          const relUnencoded = m ? `/${m[0]}` : raw;
          const rel = encodeURI(relUnencoded);
          return {
            ...r,
            url: `${VITE_API_URL}${rel}`,
          };
        });
        setRankings(adapted);
      })
      .catch((e) => console.error("랭킹 로드 실패:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center">로딩 중…</div>;

  return (
    <div className="webgame-container">
      <h1 className="text-3xl font-bold mb-6 text-center">
        이상형 월드컵 누적 랭킹
      </h1>
      <button
        onClick={() => navigate("/webgame/tournament")}
        className="tournament-button btn-back mb-4"
      >
        ← 돌아가기
      </button>
      <table className="ranking-table">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>순위</th>
            <th>영상</th>
            <th>우승 횟수</th>
            <th>우승 비율</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr key={r.videoNo}>
              <td>{i + 1}</td>
              <td>
                <div className="ranking-video-lg">
                  <video
                    src={r.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </td>
              <td>{r.winCount}</td>
              <td>
                <div className="win-bar">
                  <div
                    className="win-progress"
                    style={{ width: `${(r.winRate * 100).toFixed(1)}%` }}
                  />
                  <span className="win-label">
                    {(r.winRate * 100).toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
