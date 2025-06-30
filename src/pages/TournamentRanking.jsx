// src/pages/TournamentRanking.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function TournamentRanking() {
  const [searchParams] = useSearchParams();
  const worldCupNo = searchParams.get("worldCupNo");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!worldCupNo) return;
    axios
      .get(`${VITE_API_URL}/api/worldcup/ranking`, {
        params: { worldCupNo: Number(worldCupNo) },
      })
      .then((res) => {
        // 아까 쓰셨던 방식을 여기에도!
        const adapted = res.data.map((r) => {
          // 1) DB에서 내려준 realPath 추출
          const raw = r.videoRealPath;
          // 2) "upload/..." 이후 부분만 매칭
          const m = raw.match(/upload[\\/].*/);
          const rel = m ? `/${m[0]}` : raw;
          // 3) 풀 URL 생성
          return {
            ...r,
            url: `${VITE_API_URL}${rel}`,
          };
        });
        setRankings(adapted);
      })
      .catch((e) => console.error("랭킹 로드 실패:", e))
      .finally(() => setLoading(false));
  }, [worldCupNo]);

  if (!worldCupNo)
    return <div className="p-6 text-center">worldCupNo가 없습니다.</div>;
  if (loading) return <div className="p-6 text-center">로딩 중…</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">
        이상형 월드컵 랭킹
      </h1>
      <button
        onClick={() => navigate("/webgame/tournament")}
        className="mb-4 px-4 py-2 bg-gray-700 rounded"
      >
        ← 돌아가기
      </button>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">순위</th>
            <th className="border px-4 py-2">영상</th>
            <th className="border px-4 py-2">우승 횟수</th>
            <th className="border px-4 py-2">우승 비율</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr key={r.videoNo}>
              <td className="border px-4 py-2 text-center">{i + 1}</td>
              <td className="border px-4 py-2 text-center">
                <video
                  src={r.url} // <- 여기 URL
                  className="w-48 h-28 object-cover"
                  controls
                />
              </td>
              <td className="border px-4 py-2 text-center">{r.winCount}</td>
              <td className="border px-4 py-2 text-center">
                {(r.winRate * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
