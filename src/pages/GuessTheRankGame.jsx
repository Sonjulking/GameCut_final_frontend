import { useState } from "react";
import api from "../lib/axiosInstance";
import { TierCreator } from "./TierCreator.jsx";
const TIERS = ["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아"];

export default function GuessTheRankGame() {
  const [mode, setMode] = useState("init");
  const [questions, setQuestions] = useState([]);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const startGame = async () => {
    try {
      const res = await api.get("/game/all");
      const qs = res.data;
      setQuestions(qs);
      setOrder(qs.map((_, i) => i).sort(() => Math.random() - 0.5));
      setIdx(0);
      setScore(0);
      setMode("play");
    } catch (e) {
      console.error("문제 불러오기 실패:", e);
      alert("문제 가져오기 중 오류가 발생했습니다.");
    }
  };

  const answer = async (chosenTier) => {
    const q = questions[order[idx]];
    try {
      const res = await api.post("/game/answer", {
        gtrNo: q.gtrNo,
        tier: chosenTier,
      });
      if (res.data.correct) setScore((s) => s + 1);
      if (idx + 1 < questions.length) {
        setIdx((i) => i + 1);
      } else {
        setMode("finished");
      }
    } catch (e) {
      console.error("응답 제출 실패:", e);
      alert("답안 제출 중 오류가 발생했습니다.");
    }
  };

  if (mode === "init") {
    return (
      <div className="p-4 text-center">
        <h2>티어 맞추기</h2>
        <button onClick={startGame}>게임 시작</button>
        <button onClick={() => setMode("create")}>게임 생성</button>
      </div>
    );
  }

  if (mode === "play") {
    const q = questions[order[idx]];
    return (
      <div className="p-4">
        <video src={q.videoUrl} controls width="480" />
        <p>이 영상의 티어는?</p>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <button key={t} onClick={() => answer(t)}>
              {t}
            </button>
          ))}
        </div>
        <p>
          {idx + 1}/{questions.length} 문항
        </p>
      </div>
    );
  }

  if (mode === "finished") {
    return (
      <div className="p-4 text-center">
        <h3>게임 종료!</h3>
        <p>
          총 {questions.length}문제 중 {score}개 정답
        </p>
        <button onClick={() => setMode("init")}>다시하기</button>
      </div>
    );
  }

  // mode === "create"
  return <TierCreator onDone={() => setMode("init")} />;
}
