import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance"; // 인증 포함된 인스턴스
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myGTRHistory.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyGTRHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalCorrect: 0,
    correctRate: 0,
    gameTypeStats: {},
  });
  
  // 2025-07-17 수정됨 - 페이징 상태 추가
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    isFirst: true,
    isLast: true
  });

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 2025-07-15 수정됨 - 사이드바 토글 기능 추가
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 2025-07-15 수정됨 - 모바일에서 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  // 2025-07-17 수정됨 - 게스더랭크 기록 조회 함수를 페이징 지원으로 변경
  const fetchGTRHistory = async (page = 0) => {
    try {
      setLoading(true);
      
      // 페이징된 데이터 가져오기
      const res = await axiosInstance.get("/api/game/my-history-paged", {
        params: {
          page: page,
          size: pagination.size
        }
      });
      
      const responseData = res.data;
      console.log('페이징 데이터:', responseData);
      
      // 페이징 정보 업데이트
      setPagination({
        currentPage: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalElements: responseData.totalElements,
        size: responseData.size,
        isFirst: responseData.isFirst,
        isLast: responseData.isLast
      });
      
      const historyData = responseData.content;
      setHistory(historyData);

      // 전체 통계 계산 (전체 데이터 기반)
      const totalGames = responseData.totalElements;
      const totalCorrect = historyData.filter((item) => item.isCorrect).length;
      
      // 현재 페이지의 정답률만 계산 (전체 정답률은 전체 데이터가 필요)
      const currentPageCorrect = historyData.filter((item) => item.isCorrect).length;
      const currentPageTotal = historyData.length;
      
      // 게임타입별 통계 (현재 페이지 데이터만)
      const gameTypeStats = historyData.reduce((acc, item) => {
        const gameType = item.gameType || "기타";
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
        totalCorrect: currentPageCorrect, // 현재 페이지의 정답 수
        correctRate: currentPageTotal > 0 ? ((currentPageCorrect / currentPageTotal) * 100).toFixed(1) : 0,
        gameTypeStats,
      });
    } catch (err) {
      console.error("게스더랭크 기록 조회 실패", err);
    } finally {
      setLoading(false);
    }
  };

  // 2025-07-09 수정됨 - 게스더랭크 기록 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      // 2025-07-17 수정됨 - 초기 로드 시 첫 번째 페이지 가져오기
      fetchGTRHistory(0);
    }
  }, [isLoggedIn]);

  // 2025-07-17 수정됨 - 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchGTRHistory(newPage);
    }
  };

  // 2025-07-17 수정됨 - 페이지네이션 컴포넌트
  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);
    
    // 마지막 페이지에 과도하게 달라붙지 않도록 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="gtr-pagination">
        {/* 이전 버튼 */}
        <button
          className="pagination-btn pagination-prev"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.isFirst}
        >
          ‹ 이전
        </button>

        {/* 첫 페이지 버튼 */}
        {startPage > 0 && (
          <>
            <button
              className="pagination-btn pagination-number"
              onClick={() => handlePageChange(0)}
            >
              1
            </button>
            {startPage > 1 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {/* 페이지 번호 버튼 */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`pagination-btn pagination-number ${
              pageNum === pagination.currentPage ? "active" : ""
            }`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* 마지막 페이지 버튼 */}
        {endPage < pagination.totalPages - 1 && (
          <>
            {endPage < pagination.totalPages - 2 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-btn pagination-number"
              onClick={() => handlePageChange(pagination.totalPages - 1)}
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          className="pagination-btn pagination-next"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.isLast}
        >
          다음 ›
        </button>
      </div>
    );
  };

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
    <div className="gtr-container">
      <div className="gtr-content">
        <div className="gtr-wrapper">
          <div className="gtr-section">
            <button
              className="mypage-mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>
            <div className="gtr-header">
              <h2 className="gtr-section-title">내 게스더랭크 기록 ({pagination.totalElements}건)</h2>
              {/* 2025-07-17 수정됨 - 페이지 정보 표시 */}
              {pagination.totalElements > 0 && (
                <p className="gtr-page-info">
                  {pagination.currentPage + 1} / {pagination.totalPages} 페이지
                </p>
              )}
            </div>
            <br />
            <br />
            <div className="gtr-board-container">
              {/* 2025-07-09 수정됨 - 통계 섹션 */}
              <div className="gtr-stats-section">
                <h3 className="gtr-stats-title">📊 나의 게임 통계</h3>

                <div className="gtr-stats-grid">
                  <div className="gtr-stat-box total">
                    <div className="value">{stats.totalGames}</div>
                    <div className="label">총 게임 수</div>
                  </div>

                  <div className="gtr-stat-box correct">
                    <div className="value">{stats.totalCorrect}</div>
                    <div className="label">정답 수</div>
                  </div>

                  <div className="gtr-stat-box rate">
                    <div className="value">{stats.correctRate}%</div>
                    <div className="label">정답률</div>
                  </div>
                </div>

                {/* 게임타입별 통계 */}
                {Object.keys(stats.gameTypeStats).length > 0 && (
                  <div className="gtr-type-stats">
                    <h4 className="gtr-type-stats-title">🎮 게임별 성과</h4>
                    <div className="gtr-type-stats-grid">
                      {Object.entries(stats.gameTypeStats).map(
                        ([gameType, stat]) => (
                          <div key={gameType} className="gtr-type-box">
                            <div className="game-type">{gameType}</div>
                            <div className="stat">
                              {stat.correct}/{stat.total} (
                              {stat.total > 0
                                ? ((stat.correct / stat.total) * 100).toFixed(1)
                                : 0}
                              %)
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="gtr-list-view">
                <table className="gtr-table">
                  <thead>
                    <tr>
                      <th>게임</th>
                      <th>정답</th>
                      <th>내 답안</th>
                      <th>결과</th>
                      <th>플레이 날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="gtr-empty">
                          불러오는 중...
                        </td>
                      </tr>
                    ) : history.length > 0 ? (
                      history.map((item, index) => (
                        <tr key={`${item.gtrNo}-${index}`}>
                          <td className="gtr-game">
                            {item.gameType || "기타"}
                          </td>
                          <td className="gtr-correct">
                            <span className="tier correct">
                              {getTierIcon(item.correctTier)}
                              {item.correctTier}
                            </span>
                          </td>
                          <td className="gtr-user-answer">
                            <span
                              className={`tier ${
                                item.isCorrect ? "correct" : "wrong"
                              }`}
                            >
                              {getTierIcon(item.userAnswer)}
                              {item.userAnswer}
                            </span>
                          </td>
                          <td className="gtr-result">
                            <span
                              className={`result-badge ${
                                item.isCorrect ? "correct" : "wrong"
                              }`}
                            >
                              {item.isCorrect ? "✅ 정답" : "❌ 오답"}
                            </span>
                          </td>
                          <td className="gtr-date">
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
                      <tr className="gtr-empty-row">
                        <td colSpan="5" className="gtr-empty">
                          게스더랭크 기록이 없습니다.
                          <br />
                          <small>
                            게임을 플레이하면 여기에 기록이 나타납니다.
                          </small>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* 2025-07-17 수정됨 - 페이지네이션을 테이블 밖으로 이동 */}
              <PaginationComponent />
            </div>
          </div>
          {/* 2025-07-15 수정됨 - 모바일 오버레이 추가 */}
          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          {/* 2025-07-15 수정됨 - 사이드바에 상태 props 전달 */}
          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>
    </div>
  );
};

export default MyGTRHistory;
