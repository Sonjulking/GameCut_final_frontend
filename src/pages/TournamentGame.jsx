import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import "../styles/webgame.css";

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
  const [savedResult, setSavedResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await axiosInstance.get(`/api/board/listAll`, {
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
            // encode any spaces, #, (), etc.
            const relUnencoded = match ? `/${match[0]}` : rp;
            const rel = encodeURI(relUnencoded);
            return {
              videoNo: b.video.videoNo,
              url: `/api/${rel}`,
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
      setWinners(next);
      setFinished(true);
      const champIdx = next[0];
      const videoNo = videos[champIdx].videoNo;
      axiosInstance
        .post(`/api/worldcup/result`, {}, { params: { userNo: 1, videoNo } })
        .then((res) => setSavedResult(res.data))
        .catch((e) => console.error("챔피언 저장 실패:", e));
    }
  };

  if (loading) return <div className="text-center p-6">로딩 중…</div>;

  return (
    <div className="webgame-container">
      <h1 className="text-3xl font-bold mb-4 text-center">이상형 월드컵</h1>

      {!gameStarted && (
        <div className="bracket-select">
          <p>총 {videos.length}개의 영상 중 사용할 영상을 선택하세요</p>
          <select
            onChange={(e) => setBracketSize(Number(e.target.value))}
            value={bracketSize}
            className="tournament-select"
          >
            <option value={0} disabled>
              선택
            </option>
            {getBracketOptions().map((size) => (
              <option key={size} value={size}>
                {size}강
              </option>
            ))}
          </select>
          <button
            disabled={!bracketSize}
            onClick={startTournament}
            className="tournament-button"
          >
            시작하기
          </button>
        </div>
      )}

      {gameStarted && !finished && pairs.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            {roundSize}강
          </h2>
          <div className="tournament-grid">
            {pairs[roundIndex].map((idx) => (
              <div key={idx} className="tournament-item">
                <div className="tournament-video">
                  <video
                    src={videos[idx].url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => selectWinner(idx)}
                  className="tournament-button"
                >
                  선택
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {finished && (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">🏆 챔피언 🏆</h2>
          <div className="champion-video">
            <video
              src={videos[winners[0]].url}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={() => navigate("/webgame")}
            className="tournament-button btn-back"
          >
            돌아가기
          </button>
          {savedResult?.worldCupNo && (
            <button
              onClick={() => navigate("/webgame/tournament/ranking")}
              className="tournament-button tournament-button--secondary"
            >
              랭킹 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
