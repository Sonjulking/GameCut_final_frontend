// src/pages/WebGame.jsx
import { useState } from "react";

const TIERS = ["아이언", "브론즈", "골드", "다이아"];

export default function WebGame() {
  // 기존 상태
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffled, setShuffled] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  // 추가된 상태
  const [selectedTier, setSelectedTier] = useState(null);
  const [error, setError] = useState("");

  // 파일 선택 → URL 생성
  const handleFileChange = (e) => {
    const sel = Array.from(e.target.files);
    setFiles(sel);
    setPreviews(sel.map((f) => URL.createObjectURL(f)));
  };

  // 게임 시작
  const startGame = () => {
    setShuffled(files.map((_, i) => i).sort(() => Math.random() - 0.5));
    setGameStarted(true);
    setCurrent(0);
    setAnswers([]);
    setFinished(false);
    setSelectedTier(null);
    setError("");
  };

  // 답 제출 및 다음으로
  const submitAndNext = () => {
    if (!selectedTier) {
      setError("답을 입력하세요");
      return;
    }
    setError("");
    setAnswers((a) => [...a, { idx: shuffled[current], tier: selectedTier }]);
    if (current + 1 < shuffled.length) {
      setCurrent((c) => c + 1);
      setSelectedTier(null);
    } else {
      setFinished(true);
    }
  };

  // 다시 하기
  const resetGame = () => {
    setGameStarted(false);
    setFinished(false);
    setFiles([]);
    setPreviews([]);
    setSelectedTier(null);
    setError("");
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* 좌측 2/3: 영상 영역 */}
      <div className="w-2/3 flex flex-col p-6">
        <h1 className="text-4xl font-bold mb-4">GUESS THE RANK</h1>

        {!gameStarted ? (
          <>
            <label className="block mb-2 text-lg">동영상 파일 선택</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="mb-4 text-black"
            />
            <button
              onClick={startGame}
              disabled={!files.length}
              className={`w-full py-2 rounded mb-4 ${
                files.length
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              게임 시작
            </button>
          </>
        ) : !finished ? (
          <div className="flex-1 flex flex-col border border-white overflow-hidden">
            {/* 영상 전체가 잘 보이도록 object-contain */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <video
                src={previews[shuffled[current]]}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {/* 컨트롤 바 */}
            <div className="h-16 border-t border-gray-600 flex items-center pl-4 space-x-6 text-3xl text-gray-300">
              <button>⏮</button>
              <button>▶</button>
              <button>⏭</button>
            </div>
          </div>
        ) : (
          // 게임 완료 화면
          <div className="flex-1 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">게임 완료!</h2>
            <ul className="list-decimal list-inside pl-5 mb-6 text-lg space-y-1">
              {answers.map((a, i) => (
                <li key={i}>
                  영상 #{a.idx + 1} – 선택: {a.tier}
                </li>
              ))}
            </ul>
            <button
              onClick={resetGame}
              className="w-full py-2 bg-white text-black rounded-lg hover:bg-gray-200"
            >
              다시 하기
            </button>
          </div>
        )}
      </div>

      {/* 우측 1/3: 퀴즈 영역 */}
      <div className="w-1/3 flex-shrink-0 flex flex-col justify-center p-6 space-y-4">
        {gameStarted && !finished && (
          <>
            <p className="text-2xl font-medium">유저의 랭크는?</p>
            <p className="text-base text-gray-400 mb-4">[5point]</p>

            <ol className="list-decimal list-inside mb-4 space-y-2 text-lg">
              {TIERS.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>

            {/* 옵션 버튼 */}
            <div className="flex justify-center space-x-2 mb-2">
              {TIERS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedTier(t);
                    setError("");
                  }}
                  className={`w-24 h-24 flex items-center justify-center rounded-full text-2xl shadow-lg ${
                    selectedTier === t
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && <p className="text-red-400 text-center mb-2">{error}</p>}

            {/* 다음 버튼 */}
            <button
              onClick={submitAndNext}
              className="w-full py-3 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 text-lg"
            >
              다음
            </button>
          </>
        )}
      </div>
    </div>
  );
}
