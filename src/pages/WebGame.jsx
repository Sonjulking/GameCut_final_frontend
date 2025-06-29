// src/pages/WebGame.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TIERS = ["아이언", "브론즈", "골드", "다이아"];

export default function WebGame() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Guess The Rank state
  const [shuffled, setShuffled] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  // Tournament state
  const [pairs, setPairs] = useState([]);
  const [tIndex, setTIndex] = useState(0);
  const [winners, setWinners] = useState([]);
  const [tFinished, setTFinished] = useState(false);
  const [roundSize, setRoundSize] = useState(0);

  const nav = useNavigate();

  const handleFileChange = (e) => {
    const sel = Array.from(e.target.files);
    setFiles(sel);
    const urls = sel.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    // reset game states
    setSelectedGame(null);
    setGameStarted(false);
    setFinished(false);
    setTFinished(false);
    setAnswers([]);
    setWinners([]);
    setError("");
    setSelectedTier(null);
    setRoundSize(0);
  };

  const startGuessRank = () => {
    setShuffled(files.map((_, i) => i).sort(() => Math.random() - 0.5));
    setGameStarted(true);
    setCurrent(0);
    setAnswers([]);
    setSelectedTier(null);
    setError("");
    setFinished(false);
    setSelectedGame("guessRank");
  };

  const startTournament = () => {
    const idx = files.map((_, i) => i).sort(() => Math.random() - 0.5);
    const initialPairs = [];
    const initAuto = [];
    for (let i = 0; i < idx.length; i += 2) {
      if (i + 1 < idx.length) {
        initialPairs.push([idx[i], idx[i + 1]]);
      } else {
        initAuto.push(idx[i]);
      }
    }
    setPairs(initialPairs);
    setWinners(initAuto);
    setTIndex(0);
    setTFinished(false);
    setGameStarted(true);
    setSelectedGame("tournament");
    setRoundSize(idx.length);
  };

  const submitAndNext = () => {
    if (!selectedTier) {
      setError("등급을 선택해주세요");
      return;
    }
    setAnswers([...answers, selectedTier]);
    setSelectedTier(null);
    if (current + 1 < shuffled.length) {
      setCurrent(current + 1);
      setError("");
    } else {
      setFinished(true);
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    const vid = e.target;
    if (vid.paused) vid.play();
    else vid.pause();
  };

  const chooseTournament = (idx) => {
    const next = [...winners, idx];
    if (tIndex + 1 < pairs.length) {
      setWinners(next);
      setTIndex(tIndex + 1);
    } else {
      // end of this round
      if (next.length > 1) {
        const nextPairs = [];
        const carry = [];
        for (let i = 0; i < next.length; i += 2) {
          if (i + 1 < next.length) nextPairs.push([next[i], next[i + 1]]);
          else carry.push(next[i]);
        }
        setPairs(nextPairs);
        setWinners(carry);
        setTIndex(0);
        setRoundSize(next.length);
      } else {
        setWinners(next);
        setTFinished(true);
      }
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="w-2/3 flex flex-col p-6">
        <h1 className="text-4xl font-bold mb-4">
          {selectedGame === "tournament"
            ? "이상형 월드컵"
            : selectedGame === "guessRank"
            ? "GUESS THE RANK"
            : "웹게임"}
        </h1>

        {/* Upload & Game Selection */}
        {!gameStarted && !selectedGame && (
          <>
            <label className="block mb-2 text-lg">동영상 파일 선택</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="mb-4 text-black"
            />
            {previews.length > 0 && (
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={startTournament}
                  className="flex-1 py-2 bg-white text-black rounded hover:bg-gray-200"
                >
                  Game 1: 이상형 월드컵
                </button>
                <button
                  onClick={startGuessRank}
                  className="flex-1 py-2 bg-white text-black rounded hover:bg-gray-200"
                >
                  Game 2: Guess The Rank
                </button>
              </div>
            )}
          </>
        )}

        {/* Guess The Rank UI */}
        {selectedGame === "guessRank" &&
          gameStarted &&
          (!finished ? (
            <>
              <video
                src={previews[shuffled[current]]}
                controls
                autoPlay={false}
                className="w-full h-64 object-contain mb-4"
              />
              <p className="text-2xl font-medium mb-2">유저의 랭크는?</p>
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
              {error && <p className="text-red-400 mb-2">{error}</p>}
              <button
                onClick={submitAndNext}
                className="w-full py-3 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 text-lg"
              >
                다음
              </button>
            </>
          ) : (
            <div>
              <h2 className="text-3xl font-bold mb-4">결과</h2>
              <ul className="list-decimal list-inside space-y-2">
                {answers.map((ans, idx) => (
                  <li key={idx}>
                    Round {idx + 1}: {ans}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {/* Tournament UI */}
        {selectedGame === "tournament" && gameStarted && (
          <>
            {!tFinished ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">{roundSize}강</h2>
                <div className="flex space-x-4">
                  {pairs[tIndex]?.map((idx, side) => (
                    <div
                      key={side}
                      className="flex-1 p-2 bg-white text-black rounded shadow-lg"
                    >
                      <video
                        src={previews[idx]}
                        controls={false}
                        onClick={handleVideoClick}
                        className="w-full h-48 object-contain mb-2"
                      />
                      <button
                        onClick={() => chooseTournament(idx)}
                        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        선택
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">🏆 챔피언 🏆</h2>
                {winners[0] != null && (
                  <video
                    src={previews[winners[0]]}
                    controls
                    className="mx-auto w-1/2 h-auto object-contain"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
