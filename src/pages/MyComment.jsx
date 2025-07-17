import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myComment.css"; // 2025-07-15 수정됨 - 전용 CSS 파일로 변경

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [enrichedComments, setEnrichedComments] = useState([]); // 2025-07-15 수정됨 - 게시글 정보가 포함된 댓글 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 2025-07-15 수정됨 - 게시판 타입 이름 매핑 함수
  const getBoardTypeName = (boardTypeNo) => {
    switch (boardTypeNo) {
      case 1:
        return "자유";
      case 2:
        return "공략";
      case 3:
        return "영상";
      default:
        return "기타";
    }
  };

  // 2025-07-15 수정됨 - 게시글 정보를 가져와서 댓글과 합치는 함수
  const enrichCommentsWithBoardInfo = async (commentsData) => {
    try {
      // 중복 제거를 위해 유니크한 boardNo들만 추출
      const uniqueBoardNos = [
        ...new Set(commentsData.map((comment) => comment.boardNo)),
      ];

      // 병렬로 모든 게시글 정보 가져오기
      const boardPromises = uniqueBoardNos.map((boardNo) =>
        axiosInstance
          .get(`/api/board/detail/${boardNo}`)
          .then((response) => ({ boardNo, data: response.data }))
          .catch((error) => {
            console.warn(`게시글 ${boardNo} 정보 가져오기 실패:`, error);
            return { boardNo, data: null };
          })
      );

      const boardResults = await Promise.all(boardPromises);

      // boardNo를 키로 하는 맵 생성 (캐싱 효과)
      const boardInfoMap = {};
      boardResults.forEach((result) => {
        if (result.data) {
          boardInfoMap[result.boardNo] = result.data;
        }
      });

      // 댓글 데이터에 게시글 정보 추가
      const enriched = commentsData.map((comment) => ({
        ...comment,
        boardInfo: boardInfoMap[comment.boardNo] || null,
      }));

      return enriched;
    } catch (error) {
      console.error("게시글 정보 가져오기 실패:", error);
      return commentsData.map((comment) => ({ ...comment, boardInfo: null }));
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchComments = async () => {
      try {
        setLoading(true);

        // 1단계: 댓글 목록 가져오기
        const res = await axiosInstance.get("/api/comment/my");
        const commentsData = res.data;
        setComments(commentsData);

        // 2단계: 게시글 정보와 합치기
        const enriched = await enrichCommentsWithBoardInfo(commentsData);
        setEnrichedComments(enriched);

        setError(null);
      } catch (err) {
        console.error("❌ 댓글 목록 조회 실패", err);
        if (err.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
        } else {
          setError("댓글 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isLoggedIn, navigate]);

  // 2025-07-15 수정됨 - 게시글로 이동하는 함수
  const navigateToBoard = (boardNo, commentNo) => {
    // 댓글 위치로 스크롤되도록 해시 추가
    navigate(`/board/detail/${boardNo}#comment-${commentNo}`);
  };

  // 2025-07-15 수정됨 - 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

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

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <div className="mypage-container">
        <div className="mypage-content">
          <div className="content-wrapper">
            <div className="mypage-user-section">
              <div className="comment-container">
                <p className="error-text">로그인이 필요합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="content-wrapper">
        <div className="mypage-user-section">
          {/* 2025-07-15 수정됨 - 사용자 섹션 내부에 햄버거 버튼 추가 */}
          <button
            className="mypage-mobile-menu-toggle"
            onClick={toggleSidebar}
            aria-label="마이페이지 메뉴 토글"
          >
            <img src={hamburgerIcon} alt="마이페이지 메뉴" />
          </button>

          <div className="comment-container">
            <div className="comment-header">
              <h2 className="comment-title-header">
                내 댓글 ({enrichedComments.length}개)
              </h2>
            </div>

            <div className="comment-content">
              {loading ? (
                <div className="loading-container">
                  <p className="loading-text">댓글을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-text">{error}</p>
                </div>
              ) : enrichedComments.length > 0 ? (
                <div className="comment-grid">
                  {enrichedComments.map((comment) => (
                    <div key={comment.commentNo} className="comment-card">
                      {/* 2025-07-15 수정됨 - 게시글 정보 헤더 */}
                      <div className="comment-card-header">
                        {comment.boardInfo && (
                          <>
                            <span
                              className={`board-type-badge type-${comment.boardInfo.boardTypeNo}`}
                            >
                              {getBoardTypeName(comment.boardInfo.boardTypeNo)}
                            </span>
                            <h3
                              className="board-title-link"
                              onClick={() =>
                                navigateToBoard(
                                  comment.boardNo,
                                  comment.commentNo
                                )
                              }
                            >
                              {comment.boardInfo.boardTitle}
                            </h3>
                          </>
                        )}
                        {!comment.boardInfo && (
                          <div className="board-info-error">
                            <span className="board-type-badge type-unknown">
                              알 수 없음
                            </span>
                            <h3
                              className="board-title-link"
                              onClick={() =>
                                navigateToBoard(
                                  comment.boardNo,
                                  comment.commentNo
                                )
                              }
                            >
                              게시글 정보를 불러올 수 없습니다
                            </h3>
                          </div>
                        )}
                      </div>

                      {/* 2025-07-15 수정됨 - 댓글 내용 */}
                      <div className="comment-card-body">
                        <p
                          className="comment-content-text"
                          onClick={() =>
                            navigateToBoard(comment.boardNo, comment.commentNo)
                          }
                        >
                          {comment.commentContent}
                        </p>
                      </div>

                      {/* 2025-07-15 수정됨 - 댓글 메타 정보 */}
                      <div className="comment-card-footer">
                        <div className="comment-stats">
                          <span className="comment-likes">
                            👍 {comment.commentLike || 0}
                          </span>
                        </div>
                        <span className="comment-date">
                          {formatDate(comment.commentCreateDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💭</div>
                  <h3 className="empty-title">아직 작성한 댓글이 없어요</h3>
                  <p className="empty-description">
                    관심있는 게시글에 댓글을 남겨보세요!
                  </p>
                  <button
                    className="go-to-board-btn"
                    onClick={() => navigate("/board")}
                  >
                    게시판 둘러보기
                  </button>
                </div>
              )}
            </div>
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
  );
};

export default MyComments;
