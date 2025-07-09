// 2025-07-09 수정됨 - 내 게스더랭크 기록 페이지 생성
import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance"; // 인증 포함된 인스턴스
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const MyGTRHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalCorrect: 0,
    correctRate: 0,
    gameTypeStats: {}
  });

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 2025-07-09 수정됨 - 게스더랭크 기록 불러오기
  useEffect(() => {
    const fetchGTRHistory = async () => {
      try {
        const res = await axios.get("/game/my-history");
        const sorted = res.data.sort(
          (a, b) => new Date(b.playDate) - new Date(a.playDate)
        );
        setHistory(sorted);

        // 통계 계산
        const totalGames = sorted.length;
        const totalCorrect = sorted.filter(item => item.isCorrect).length;
        const correctRate = totalGames > 0 ? ((totalCorrect / totalGames) * 100).toFixed(1) : 0;

        // 게임타입별 통계
        const gameTypeStats = sorted.reduce((acc, item) => {
          const gameType = item.gameType || '기타';
          if (!acc[gameType]) {
            acc[gameType] = { total: 0, correct: 0 };
          }
          acc[gameType].total++;
          if (item.isCorrect) {
            acc[gameType].correct++;
          }
          return acc;
        }, {});

        setStats({
          totalGames,
          totalCorrect,
          correctRate,
          gameTypeStats
        });

      } catch (err) {
        console.error("게스더랭크 기록 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchGTRHistory();
    }
  }, [isLoggedIn]);

  // 2025-07-09 수정됨 - 티어 아이콘 매핑
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

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title-header">
                  내 게스더랭크 기록 ({history.length}건)
                </h2>
              </div>

              {/* 2025-07-09 수정됨 - 통계 섹션 */}
              <div className="gtr-stats-section" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{ 
                  color: '#f1f5f9', 
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}>
                  📊 나의 게임 통계
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {stats.totalGames}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>총 게임 수</div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {stats.totalCorrect}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>정답 수</div>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {stats.correctRate}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>정답률</div>
                  </div>
                </div>

                {/* 게임타입별 통계 */}
                {Object.keys(stats.gameTypeStats).length > 0 && (
                  <div>
                    <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1rem' }}>
                      🎮 게임별 성과
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      {Object.entries(stats.gameTypeStats).map(([gameType, stat]) => (
                        <div key={gameType} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          textAlign: 'center',
                          fontSize: '0.875rem'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{gameType}</div>
                          <div style={{ color: '#94a3b8' }}>
                            {stat.correct}/{stat.total} ({stat.total > 0 ? ((stat.correct / stat.total) * 100).toFixed(1) : 0}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="list-view-container">
                <table className="mypage_board_table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>게임</th>
                      <th style={{ textAlign: "center" }}>정답</th>
                      <th style={{ textAlign: "center" }}>내 답안</th>
                      <th style={{ textAlign: "center" }}>결과</th>
                      <th style={{ textAlign: "center" }}>플레이 날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          불러오는 중...
                        </td>
                      </tr>
                    ) : history.length > 0 ? (
                      history.map((item, index) => (
                        <tr key={`${item.gtrNo}-${index}`}>
                          <td style={{ textAlign: "center", fontWeight: "500" }}>
                            {item.gameType || '기타'}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#10b981',
                              fontWeight: 'bold'
                            }}>
                              {getTierIcon(item.correctTier)}
                              {item.correctTier}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: item.isCorrect ? '#10b981' : '#ef4444',
                              fontWeight: 'bold'
                            }}>
                              {getTierIcon(item.userAnswer)}
                              {item.userAnswer}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                background: item.isCorrect 
                                  ? 'rgba(16, 185, 129, 0.2)' 
                                  : 'rgba(239, 68, 68, 0.2)',
                                color: item.isCorrect ? '#10b981' : '#ef4444',
                                border: `1px solid ${item.isCorrect ? '#10b981' : '#ef4444'}`,
                              }}
                            >
                              {item.isCorrect ? '✅ 정답' : '❌ 오답'}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontSize: '0.875rem', color: '#94a3b8' }}>
                            {new Date(item.playDate).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="mypage_empty_row">
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          게스더랭크 기록이 없습니다.
                          <br />
                          <small style={{ color: '#94a3b8' }}>
                            게임을 플레이하면 여기에 기록이 나타납니다.
                          </small>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyGTRHistory;
