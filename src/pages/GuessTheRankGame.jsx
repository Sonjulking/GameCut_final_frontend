import { useState } from "react";
import axiosInstance from "../lib/axiosInstance"; // 2025년 7월 8일 수정됨 - axiosInstance로 수정
import { TierCreator } from "./TierCreator.jsx";
// 2025년 7월 8일 수정됨 - 게임 종류별 필터링 및 주관식 입력 방식으로 변경

// 2025년 7월 8일 수정됨 - 하드코딩된 게임 종류 목록
const GAME_TYPES = ["ALL", "롤", "발로란트", "배그", "오버워치", "애이펙스"];

export default function GuessTheRankGame() {
  const [mode, setMode] = useState("init");
  const [questions, setQuestions] = useState([]);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState(""); // 2025년 7월 8일 수정됨 - 주관식 답안 입력
  const [selectedGameType, setSelectedGameType] = useState("ALL"); // 2025년 7월 8일 수정됨 - 선택된 게임 종류

  // 2025년 7월 8일 수정됨 - 게임 종류별 문제 로드
  const startGame = async () => {
    try {
      const params = selectedGameType === "ALL" ? {} : { gameType: selectedGameType };
      console.log('게임 시작 요청:', { selectedGameType, params });
      
      const res = await axiosInstance.get("/game/all", { params });
      const qs = res.data;
      
      console.log('불러온 문제 수:', qs.length);
      
      if (qs.length === 0) {
        alert("선택한 게임의 문제가 없습니다.");
        return;
      }
      
      setQuestions(qs);
      setOrder(qs.map((_, i) => i).sort(() => Math.random() - 0.5));
      setIdx(0);
      setScore(0);
      setUserAnswer(""); // 답안 초기화
      setMode("play");
    } catch (e) {
      console.error("문제 불러오기 실패:", e);
      console.error("상세 오류:", e.response?.data);
      console.error("상태 코드:", e.response?.status);
      alert(`문제 가져오기 중 오류가 발생했습니다: ${e.response?.data?.message || e.message}`);
    }
  };

  // 2025년 7월 8일 수정됨 - 주관식 답안 제출
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("티어를 입력해주세요.");
      return;
    }
    
    const q = questions[order[idx]];
    try {
      console.log('답안 제출:', { gtrNo: q.gtrNo, tier: userAnswer.trim() });
      
      const res = await axiosInstance.post("/game/answer", {
        gtrNo: q.gtrNo,
        tier: userAnswer.trim(),
      });
      
      console.log('답안 결과:', res.data);
      
      if (res.data.correct) {
        setScore((s) => s + 1);
        alert(`정답! 정답: ${q.tier}`);
      } else {
        alert(`오답! 정답: ${q.tier}, 당신의 답: ${userAnswer}`);
      }
      
      if (idx + 1 < questions.length) {
        setIdx((i) => i + 1);
        setUserAnswer(""); // 다음 문제를 위해 답안 초기화
      } else {
        setMode("finished");
      }
    } catch (e) {
      console.error("응답 제출 실패:", e);
      console.error("상세 오류:", e.response?.data);
      console.error("상태 코드:", e.response?.status);
      alert(`답안 제출 중 오류가 발생했습니다: ${e.response?.data?.message || e.message}`);
    }
  };

  if (mode === "init") {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">티어 맞추기</h2>
        
        {/* 2025년 7월 8일 수정됨 - 게임 종류 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">게임 종류 선택</label>
          <select
            value={selectedGameType}
            onChange={(e) => setSelectedGameType(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            {GAME_TYPES.map((gameType) => (
              <option key={gameType} value={gameType}>
                {gameType === "ALL" ? "전체 게임" : gameType}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            게임 시작
          </button>
          <button 
            onClick={() => setMode("create")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            게임 생성
          </button>
        </div>
      </div>
    );
  }

  if (mode === "play") {
    const q = questions[order[idx]];
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">티어 맞추기</h3>
          <p className="text-gray-600">
            {selectedGameType !== "ALL" && `게임: ${q.gameType || selectedGameType} | `}
            문제 {idx + 1}/{questions.length} | 점수: {score}
          </p>
        </div>
        
        <div className="mb-6">
          <video 
            src={q.videoUrl} 
            controls 
            className="w-full max-w-lg mx-auto rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium mb-4">이 영상의 티어는?</p>
          
          {/* 2025년 7월 8일 수정됨 - 주관식 입력 방식 */}
          <div className="mb-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder="티어를 입력하세요 (예: 아이언, 브론즈, 실버...)"
              className="w-full max-w-sm px-4 py-2 border rounded text-center text-lg"
              autoFocus
            />
          </div>
          
          <button
            onClick={submitAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded text-lg"
          >
            답안 제출
          </button>
        </div>
      </div>
    );
  }

  if (mode === "finished") {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-4">게임 종료!</h3>
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p className="text-lg mb-2">
            총 {questions.length}문제 중 <span className="font-bold text-blue-600">{score}개</span> 정답
          </p>
          <p className="text-xl font-bold text-green-600">정답률: {percentage}%</p>
          {selectedGameType !== "ALL" && (
            <p className="text-sm text-gray-600 mt-2">게임: {selectedGameType}</p>
          )}
        </div>
        <button 
          onClick={() => setMode("init")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          다시하기
        </button>
      </div>
    );
  }

  // mode === "create"
  return <TierCreator onDone={() => setMode("init")} />;
}
