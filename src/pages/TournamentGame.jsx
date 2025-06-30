// src/pages/TournamentGame.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function TournamentGame() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(0);
  const [pairs, setPairs] = useState([]);
  const [winners, setWinners] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundSize, setRoundSize] = useState(0);
  const [finished, setFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // 저장된 결과(worldCupNo)를 담을 상태
  const [savedResult, setSavedResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await axios.get(`${VITE_API_URL}/board/listAll`, {
          params: { page: 0, size: 1000, boardTypeNo: 3 },
        });
        const list = res.data.content || [];
        const vids = list
          .filter(
            (b) =>
              b.video &&
              b.video.attachFile &&
              b.video.attachFile.realPath &&
              b.video.videoNo
          )
          .map((b) => {
            const rp = b.video.attachFile.realPath;
            const match = rp.match(/upload[\\/].*/);
            const rel = match ? `/${match[0]}` : rp;
            return {
              boardNo: b.boardNo,
              videoNo: b.video.videoNo,
              url: `${VITE_API_URL}${rel}`,
            };
          });
        setVideos(vids);
      } catch (err) {
        console.error("영상 게시글 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoards();
  }, []);

  // 2의 제곱수 브라켓 옵션
  const getBracketOptions = () => {
    const n = videos.length;
    if (n < 2) return [];
    let size = 1 << Math.floor(Math.log2(n));
    const opts = [];
    while (size >= 2) {
      opts.push(size);
      size >>= 1;
    }
    return opts;
  };

  const startTournament = () => {
    if (!bracketSize) return;
    const idxs = videos
      .map((_, i) => i)
      .sort(() => 0.5 - Math.random())
      .slice(0, bracketSize);

    const newPairs = [];
    const auto = [];
    for (let i = 0; i < idxs.length; i += 2) {
      if (i + 1 < idxs.length) newPairs.push([idxs[i], idxs[i + 1]]);
      else auto.push(idxs[i]);
    }

    setPairs(newPairs);
    setWinners(auto);
    setRoundSize(idxs.length);
    setRoundIndex(0);
    setFinished(false);
    setGameStarted(true);
  };

  const selectWinner = (videoIdx) => {
    const next = [...winners, videoIdx];

    if (roundIndex + 1 < pairs.length) {
      setWinners(next);
      setRoundIndex(roundIndex + 1);
    } else if (next.length > 1) {
      // 다음 라운드 준비
      const nextPairs = [];
      const carry = [];
      for (let i = 0; i < next.length; i += 2) {
        if (i + 1 < next.length) nextPairs.push([next[i], next[i + 1]]);
        else carry.push(next[i]);
      }
      setPairs(nextPairs);
      setWinners(carry);
      setRoundSize(next.length);
      setRoundIndex(0);
    } else {
      // 챔피언 확정
      setWinners(next);
      setFinished(true);

      // 챔피언 저장 API 호출
      const champIdx = next[0];
      const videoNo = videos[champIdx].videoNo;
      axios
        .post(
          `${VITE_API_URL}/api/worldcup/result`,
          {},
          { params: { userNo: 1, videoNo } } // TODO: userNo는 로그인 정보에서
        )
        .then((res) => {
          setSavedResult(res.data);
        })
        .catch((e) => {
          console.error("챔피언 저장 실패:", e);
        });
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-white">로딩 중…</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">이상형 월드컵</h1>

      {/* 브라켓 선택 */}
      {!gameStarted && (
        <div className="text-center">
          <p>총 {videos.length}개의 영상 중 사용할 영상을 선택하세요</p>
          <select
            className="mt-2 p-2 rounded text-black"
            value={bracketSize}
            onChange={(e) => setBracketSize(Number(e.target.value))}
          >
            <option value={0} disabled>
              강을 선택
            </option>
            {getBracketOptions().map((size) => (
              <option key={size} value={size}>
                {size}강
              </option>
            ))}
          </select>
          <button
            className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            disabled={!bracketSize}
            onClick={startTournament}
          >
            시작하기
          </button>
        </div>
      )}

      {/* 토너먼트 진행 */}
      {gameStarted && !finished && pairs.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            {roundSize}강
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {pairs[roundIndex].map((idx) => (
              <div
                key={idx}
                className="bg-white text-black p-3 rounded shadow flex flex-col items-center"
              >
                <video
                  src={videos[idx].url}
                  controls
                  className="w-full h-40 object-contain mb-3"
                />
                <button
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                  onClick={() => selectWinner(idx)}
                >
                  선택
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 챔피언 & 버튼 */}
      {finished && (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">🏆 챔피언 🏆</h2>
          <video
            src={videos[winners[0]].url}
            controls
            className="mx-auto w-2/3 h-auto object-contain mb-6"
          />

          <button
            className="mr-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            onClick={() => navigate("/webgame")}
          >
            돌아가기
          </button>

          {/* 저장된 worldCupNo가 있을 때만 보여줌 */}
          {savedResult?.worldCupNo && (
            <button
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
              onClick={() =>
                navigate(
                  `/webgame/tournament/ranking?worldCupNo=${savedResult.worldCupNo}`
                )
              }
            >
              랭킹 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
