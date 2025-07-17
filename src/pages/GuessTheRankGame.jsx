// 2025-07-08 수정됨 - 주관식에서 선택형 방식으로 변경, 게임별 전체 티어 시스템 적용, 문제 수 선택 기능 추가
// 2025-07-08 수정됨 - 비디오 URL 처리 방식 개선 (백엔드 fileUrl + 프론트엔드 VITE_API_URL 조합)
// 2025-07-08 수정됨 - 게임 종료 후 네비게이션 개선 및 버튼 텍스트 변경
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { TierCreator } from "./TierCreator.jsx";
import "../styles/webgame.css";

// 게임별 티어 시스템 정의 (TierCreator와 동일)
const GAME_TIER_SYSTEMS = {
  롤: [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "그랜드마스터",
    "챌린저",
  ],
  발로란트: [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "초월",
    "불멸",
    "레디언트",
  ],
  배그: ["브론즈", "실버", "골드", "플래티넘", "다이아몬드", "마스터"],
  오버워치: [
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "그랜드마스터",
  ],
  에이펙스: [
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아몬드",
    "마스터",
    "프레데터",
  ],
};

const GAME_TYPES = ["ALL", ...Object.keys(GAME_TIER_SYSTEMS)];

// 2025-07-08 수정됨 - 티어별 아이콘 매핑
const getTierIcon = (tier) => {
  const icons = {
    아이언: "🔩",
    브론즈: "🥉",
    실버: "🥈",
    골드: "🥇",
    플래티넘: "💎",
    다이아몬드: "💠",
    마스터: "👑",
    그랜드마스터: "⭐",
    챌린저: "🏆",
    초월: "⬆️",
    불멸: "☠️",
    레디언트: "✨",
    프레데터: "⚔️",
  };
  return icons[tier] || "🎯";
};

// 2025-07-08 수정됨 - 문제 수 옵션 생성 함수
const getQuestionCountOptions = (totalQuestions) => {
  if (totalQuestions <= 5) {
    return [totalQuestions];
  }

  const options = [];
  for (let i = 5; i <= totalQuestions; i += 5) {
    options.push(i);
  }

  // 전체 문제 수가 5의 배수가 아닌 경우 마지막에 추가
  if (totalQuestions % 5 !== 0) {
    options.push(totalQuestions);
  }

  return options;
};

export default function GuessTheRankGame() {
  const navigate = useNavigate(); // 2025-07-08 수정됨 - 라우팅을 위한 네비게이션 훅 추가
  const [mode, setMode] = useState("init");
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]); // 2025-07-08 수정됨 - 전체 문제 저장용
  // 2025-07-17 수정됨 - order 배열 사용하지 않으므로 제거 (단순히 순차적 인덱스만 사용)
  // const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedGameType, setSelectedGameType] = useState("ALL");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5); // 2025-07-08 수정됨 - 선택된 문제 수
  const [availableQuestions, setAvailableQuestions] = useState(0); // 2025-07-08 수정됨 - 사용 가능한 문제 수
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false); // 2025-07-08 수정됨 - 문제 로딩 상태

  // 2025-07-08 수정됨 - 게임 타입 변경시 문제 수 정보 가져오기
  useEffect(() => {
    const fetchQuestionCount = async () => {
      if (mode !== "init") return;

      setIsLoadingQuestions(true);
      try {
        const params =
          selectedGameType === "ALL" ? {} : { gameType: selectedGameType };
        const res = await axiosInstance.get("/api/game/all", { params });
        const questionCount = res.data.length;

        setAvailableQuestions(questionCount);
        setAllQuestions(res.data);

        // 선택된 문제 수가 사용 가능한 문제 수보다 많으면 조정
        if (selectedQuestionCount > questionCount) {
          setSelectedQuestionCount(
            questionCount > 0 ? Math.min(5, questionCount) : 5
          );
        }
      } catch (e) {
        console.error("문제 수 조회 실패:", e);
        setAvailableQuestions(0);
        setAllQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestionCount();
  }, [selectedGameType, mode]);

  // 2025-07-08 수정됨 - 전체 선택 시에도 현재 문제의 게임 타입에 맞는 티어 옵션 표시
  const getCurrentTierOptions = () => {
    // currentQuestion이 없으면 기본 티어 반환
    if (!currentQuestion) {
      return ["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아몬드"];
    }

    // 현재 문제의 게임 타입 가져오기
    const gameType = currentQuestion.gameType;

    // 해당 게임 타입의 티어 시스템 반환 (없으면 기본 티어)
    return (
      GAME_TIER_SYSTEMS[gameType] || [
        "아이언",
        "브론즈",
        "실버",
        "골드",
        "플래티넘",
        "다이아몬드",
      ]
    );
  };

  // 2025-07-08 수정됨 - 게임 시작 (선택된 문제 수만큼)
  const startGame = () => {
    if (allQuestions.length === 0) {
      alert("선택한 게임의 문제가 없습니다.");
      return;
    }

    // 선택된 문제 수만큼 랜덤하게 선택
    const actualQuestionCount = Math.min(
      selectedQuestionCount,
      allQuestions.length
    );
    const shuffledAll = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledAll.slice(0, actualQuestionCount);

    console.log("게임 시작:", {
      selectedGameType,
      totalAvailable: allQuestions.length,
      selectedCount: actualQuestionCount,
    });

    setQuestions(selectedQuestions);
    // 2025-07-17 수정됨 - order 배열 사용하지 않으므로 제거 (단순히 순차적 인덱스 사용)
    setIdx(0);
    setScore(0);
    setSelectedAnswer("");
    setCurrentQuestion(selectedQuestions[0]);
    setResult(null);
    setMode("play");
  };

  // 답안 제출
  // 2025-07-17 수정됨 - 답안 제출 시 order 배열 사용하지 않고 직접 인덱스로 접근
  const submitAnswer = async () => {
    if (!selectedAnswer) {
      alert("티어를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    const q = questions[idx]; // order 배열 제거하여 직접 인덱스 사용

    try {
      console.log("답안 제출:", { gtrNo: q.gtrNo, tier: selectedAnswer });

      const res = await axiosInstance.post("/api/game/answer", {
        gtrNo: q.gtrNo,
        tier: selectedAnswer,
      });

      console.log("답안 결과:", res.data);

      const isCorrect = res.data.correct;
      if (isCorrect) {
        setScore((s) => s + 1);
      }

      setResult({
        correct: isCorrect,
        correctAnswer: q.tier,
        userAnswer: selectedAnswer,
      });
    } catch (e) {
      console.error("응답 제출 실패:", e);
      alert(
        `답안 제출 중 오류가 발생했습니다: ${
          e.response?.data?.message || e.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다음 문제로 진행
  // 2025-07-17 수정됨 - 동영상 넘어가지 않는 문제 해결: order 배열 제거 및 상태 업데이트 순서 개선
  const goToNext = () => {
    if (idx + 1 < questions.length) {
      const nextIdx = idx + 1;
      const nextQuestion = questions[nextIdx]; // order 배열 제거하여 직접 접근
      setIdx(nextIdx);
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer("");
      setResult(null);
    } else {
      setMode("finished");
    }
  };

  // 초기 화면 - 여기서 문항 갯수를 선택할 수 있습니다
  if (mode === "init") {
    const questionCountOptions = getQuestionCountOptions(availableQuestions);

    return (
      <div className="webgame-container">
        <div className="tier-game-init">
          <h2 className="tier-game-init-title">티어 맞추기</h2>

          {/* 게임 종류 선택 */}
          <div className="tier-game-form-group">
            <label className="tier-game-label">게임 종류 선택</label>
            <select
              value={selectedGameType}
              onChange={(e) => setSelectedGameType(e.target.value)}
              className="tier-game-select"
            >
              {GAME_TYPES.map((gameType) => (
                <option key={gameType} value={gameType}>
                  {gameType === "ALL" ? "전체 게임" : gameType}
                </option>
              ))}
            </select>
          </div>

          {/* 문제 수 선택 */}
          <div className="tier-game-form-group">
            <label className="tier-game-label">
              문제 수 선택
              {isLoadingQuestions ? (
                <span style={{ color: "#94a3b8" }}> (로딩 중...)</span>
              ) : (
                <span style={{ color: "#94a3b8" }}>
                  {" "}
                  (총 {availableQuestions}개 문제 사용 가능)
                </span>
              )}
            </label>

            {availableQuestions > 0 ? (
              <div className="tier-question-count-options">
                {questionCountOptions.map((count) => (
                  <label key={count} className="tier-question-count-option">
                    <input
                      type="radio"
                      name="questionCount"
                      value={count}
                      checked={selectedQuestionCount === count}
                      onChange={(e) =>
                        setSelectedQuestionCount(Number(e.target.value))
                      }
                      className="tier-question-count-radio"
                    />
                    <span className="tier-question-count-label">
                      {count}문제
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              !isLoadingQuestions && (
                <div className="tier-no-questions">
                  선택한 게임에 사용 가능한 문제가 없습니다.
                </div>
              )
            )}
          </div>

          <div className="tier-game-form-group">
            <button
              onClick={startGame}
              disabled={availableQuestions === 0 || isLoadingQuestions}
              className="tier-game-btn tier-game-btn--primary"
            >
              {isLoadingQuestions ? "문제 확인 중..." : "게임 시작"}
            </button>
            <button
              onClick={() => setMode("create")}
              className="tier-game-btn tier-game-btn--success"
            >
              문제 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 게임 플레이 화면
  if (mode === "play") {
    const q = currentQuestion;
    const tierOptions = getCurrentTierOptions();

    return (
      <div className="webgame-container">
        <div className="tier-game-container">
          {/* 헤더 */}
          <div className="tier-game-header">
            <h3 className="tier-game-title">티어 맞추기</h3>
            <div className="tier-game-progress">
              {/* 2025-07-08 수정됨 - 전체 선택 시에도 현재 문제의 게임 타입 표시 */}
              {q && <span>게임: {q.gameType || selectedGameType}</span>}
              <span>
                문제 {idx + 1}/{questions.length}
              </span>
              <span className="tier-game-score">점수: {score}</span>
            </div>
          </div>

          {/* 비디오 */}
          <div className="tier-game-video-container">
            {/* 2025년 7월 8일 수정됨 - 백엔드에서 fileUrl을 반환하므로 VITE_API_URL과 조합 */}
            {/* 2025-07-17 수정됨 - 동영상 넘어가지 않는 문제 해결: key 속성 추가로 제대로 리렌더링 */}
            <video
              key={q?.gtrNo || idx} // 고유한 key 추가로 동영상 변경 시 제대로 리렌더링
              controls
              className="tier-game-video"
              onError={(e) => {
                console.error("비디오 로드 실패:", e);
                e.target.alt = "비디오를 로드할 수 없습니다.";
              }}
            >
              {q?.videoUrl && (
                <source
                  src={import.meta.env.VITE_API_URL + q.videoUrl}
                  type="video/mp4"
                />
              )}
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </div>

          {/* 문제 */}
          <div className="tier-game-question">
            <h4 className="tier-game-question-title">
              {/* 2025-07-08 수정됨 - 전체 선택 시에도 현재 문제의 게임 타입 표시 */}
              이 플레이어의 {q?.gameType || selectedGameType} 티어를 맞춰보세요!
            </h4>

            {/* 2025-07-08 수정됨 - 티어 선택 옵션들 */}
            <div className="tier-options-grid">
              {tierOptions.map((tier) => (
                <button
                  key={tier}
                  className={`tier-option-btn ${
                    selectedAnswer === tier ? "tier-option-btn--selected" : ""
                  } ${
                    isSubmitting || result ? "tier-option-btn--disabled" : ""
                  }`}
                  onClick={() => !result && setSelectedAnswer(tier)}
                  disabled={isSubmitting || result}
                >
                  <span className="tier-option-icon">{getTierIcon(tier)}</span>
                  <span className="tier-option-name">{tier}</span>
                </button>
              ))}
            </div>

            {/* 답안 제출 버튼 */}
            {!result && (
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer || isSubmitting}
                className="tier-game-btn tier-game-btn--success"
                style={{ maxWidth: "300px", margin: "0 auto" }}
              >
                {isSubmitting ? "제출 중..." : "답안 제출"}
              </button>
            )}
          </div>

          {/* 결과 표시 */}
          {result && (
            <div
              className={`tier-game-result ${
                result.correct
                  ? "tier-game-result--correct"
                  : "tier-game-result--incorrect"
              }`}
            >
              <h3 className="tier-game-result-title">
                {result.correct ? "정답입니다!" : "틀렸습니다"}
              </h3>
              <div className="tier-game-result-details">
                <div className="tier-game-result-item">
                  <span className="tier-game-result-label">정답:</span>
                  <span className="tier-game-result-value">
                    {getTierIcon(result.correctAnswer)} {result.correctAnswer}
                  </span>
                </div>
                <div className="tier-game-result-item">
                  <span className="tier-game-result-label">선택한 답:</span>
                  <span className="tier-game-result-value">
                    {getTierIcon(result.userAnswer)} {result.userAnswer}
                  </span>
                </div>
              </div>
              <button
                onClick={goToNext}
                className="tier-game-btn tier-game-btn--primary"
                style={{ maxWidth: "200px", margin: "0 auto" }}
              >
                {idx + 1 < questions.length ? "다음 문제" : "결과 보기"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 게임 종료 화면
  if (mode === "finished") {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    return (
      <div className="webgame-container">
        <div className="tier-game-finished">
          <h3 className="tier-game-finished-title">게임 종료</h3>
          <div className="tier-game-stats">
            <p className="tier-game-stats-score">
              총 {questions.length}문제 중{" "}
              <span style={{ color: "#10b981", fontWeight: "bold" }}>
                {score}개
              </span>{" "}
              정답
            </p>
            <p className="tier-game-stats-percentage">정답률: {percentage}%</p>
            {selectedGameType !== "ALL" && (
              <p className="tier-game-stats-info">게임: {selectedGameType}</p>
            )}

            {/* 등급 표시 */}
            <div className="tier-game-grade">
              <p className="tier-game-grade-text">
                {percentage >= 90
                  ? "챌린저급"
                  : percentage >= 80
                  ? "다이아몬드급"
                  : percentage >= 70
                  ? "골드급"
                  : percentage >= 60
                  ? "실버급"
                  : percentage >= 50
                  ? "브론즈급"
                  : "아이언급"}
              </p>
            </div>
          </div>

          <div className="tier-game-form-group">
            {/* 2025-07-08 수정됨 - 게임 종료 후 네비게이션 버튼 개선 */}
            <button
              onClick={() => setMode("init")}
              className="tier-game-btn tier-game-btn--primary"
            >
              다시하기
            </button>
            <button
              onClick={() => navigate("/webgame")}
              className="tier-game-btn"
              style={{ background: "#6366f1", color: "white" }}
            >
              메인으로
            </button>
            <button
              onClick={() => setMode("create")}
              className="tier-game-btn tier-game-btn--success"
            >
              문제 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 게임 생성 모드
  return (
    <div className="webgame-container">
      <TierCreator onDone={() => setMode("init")} />
    </div>
  );
}
