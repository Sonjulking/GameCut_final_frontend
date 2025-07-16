// 2025-07-03 16:10 생성됨
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Box, Chip, Stack } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import CommentSection from "./CommentSection.jsx";
import UserProfilePopup from "../pages/UserProfilePopup.jsx";
import "../styles/boardDetail.css";
import axiosInstance from "../lib/axiosInstance.js";
import ReportModal from "./ReportModal.jsx";
import { useSelector } from "react-redux";
// 2025-07-14 수정됨 - 시간 표시 포맷 유틸리티 추가
import { formatRelativeTimeKo } from "../util/timeFormatUtil.js";

const BoardDetail = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);

  // 세로 영상 감지 상태
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  const user = useSelector((state) => state.auth.user);

  // 신고 모달 상태
  const [isReportOpen, setIsReportOpen] = useState(false);

  // 프로필 팝업 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const loadBoardDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/board/detail/${boardNo}`);
      setBoard(response.data);
      await loadComments();
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      alert("게시글을 불러올 수 없습니다.");
      navigate("/board/list");
    } finally {
      setLoading(false);
    }
  };

  // 댓글 로드 함수
  const loadComments = async () => {
    try {
      const response = await axiosInstance.get(`/api/comment/board/${boardNo}`);
      setComments(response.data);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  // 좋아요 여부 체크
  const checkLikeStatus = async () => {
    if (!isLoggedIn) {
      setIsLiked(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/board/isLike/${boardNo}`);
      setIsLiked(response.data);
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
      setIsLiked(false);
    }
  };

  // 2025년 7월 14일 수정됨 - 좋아요 취소 기능 제거, 단순화
  const handleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 좋아요가 가능합니다.");
      return;
    }

    if (isLiked) {
      alert("이미 좋아요를 누르셨습니다.");
      return;
    }

    try {
      await axiosInstance.post(`/api/board/like/${boardNo}`);

      // 포인트 지급 (본인 게시글이 아닌 경우에만)
      if (board && board.user && user && board.user.userNo !== user.userNo) {
        try {
          const pointData = new FormData();
          pointData.append("point", 5);
          pointData.append("reason", "게시글 좋아요 획득");
          pointData.append("recievedUserNo", board.user.userNo);
          await axiosInstance.post("/api/user/updatePoint", pointData);
        } catch (pointError) {
          console.error("게시글 좋아요 포인트 지급 실패:", pointError);
        }
      }

      // 상태 업데이트
      setIsLiked(true);
      setBoard((prev) => ({
        ...prev,
        boardLike: prev.boardLike + 1,
      }));
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/api/board/${boardNo}`);
        alert("게시글이 삭제되었습니다.");
        navigate("/board/list");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/board/edit/${boardNo}`);
  };

  const handleBackToList = () => {
    navigate("/board/list");
  };

  // 신고 버튼 클릭
  const handleReport = () => {
    setIsReportOpen(true);
  };

  // 신고 제출
  const handleReportSubmit = async (content) => {
    try {
      const res = await axiosInstance.post("/api/report", {
        boardNo: board.boardNo,
        reportContent: content,
        reportType: "게시글",
      });

      if (res.data.success) {
        alert("신고가 접수되었습니다.");
      } else {
        alert("신고 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("신고 실패", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  // 비디오 로드 완료 시 종횡비 체크
  const handleVideoLoad = (e) => {
    const { videoWidth, videoHeight } = e.target;
    const aspectRatio = videoWidth / videoHeight;
    setIsVerticalVideo(aspectRatio < 1);
  };

  const handleProfileClick = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 프로필을 확인할 수 있습니다.");
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/user/${board.user.userNo}`);
      setSelectedUser(res.data);
      setProfileOpen(true);
    } catch (error) {
      console.error("유저 정보 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (boardNo) {
      window.scrollTo(0, 0);
      checkLikeStatus();
      loadBoardDetail();
    }
  }, [boardNo]);

  if (loading) {
    return (
      <div className="board-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-detail-container">
        <div className="error-message">
          <h2>게시글을 찾을 수 없습니다</h2>
          <button onClick={handleBackToList} className="back-btn">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const typeName = getBoardTypeName(board.boardTypeNo);

  return (
    <div className="board-detail-container">
      {/* 헤더 */}
      <div className="detail-header">
        <button onClick={handleBackToList} className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
          </svg>
          목록으로
        </button>
        <div className="detail-actions">
          {user && user.userNo == board.user.userNo ? (
            <>
              <button onClick={handleEdit} className="edit-btn">
                수정
              </button>
              <button onClick={handleDelete} className="board-delete-btn">
                삭제
              </button>
            </>
          ) : null}
          <button onClick={handleReport} className="board-report-btn">
            신고
          </button>
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className="detail-content">
        <div className="detail-meta">
          <div className="meta-left">
            <span className={`detail-type-badge type-${board.boardTypeNo}`}>
              {typeName}
            </span>
            <h1 className="detail-title">{board.boardTitle}</h1>
          </div>
          <div className="meta-right">
            <div className="author-info">
              <span
                className="author-name"
                onClick={handleProfileClick}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {board.user.userNickname}
              </span>
              <span className="create-date">
                {/* 2025-07-14 수정됨 - 상대적 시간 표시로 변경 */}
                {formatRelativeTimeKo(board.boardCreateDate)}
              </span>
            </div>
            <div className="board-stats">
              <span className="stat-item">조회수: {board.boardCount}</span>
              {/* 2025년 7월 14일 수정됨 - 좋아요 버튼 단순화 */}
              <button
                onClick={handleLike}
                className={`stat-item like-btn ${isLiked ? "liked" : ""}`}
                disabled={isLiked}
              >
                좋아요 {board.boardLike}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-body">
          {board.boardTypeNo === 3 && board.video?.attachFile && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <video
                  src={`${import.meta.env.VITE_API_URL}${
                    board.video.attachFile.fileUrl
                  }`}
                  onLoadedMetadata={handleVideoLoad}
                  style={{
                    width: isVerticalVideo ? "auto" : "100%",
                    maxWidth: isVerticalVideo ? "min(400px, 90vw)" : "100%",
                    maxHeight: isVerticalVideo ? "min(600px, 60vh)" : "70vh",
                    height: isVerticalVideo ? "auto" : "auto",
                    objectFit: "contain",
                    backgroundColor: "#000",
                    borderRadius: "8px",
                    border: "1px solid #333",
                  }}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
              <Box
                sx={{
                  maxHeight: "100px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {board.video?.tagByVideoList?.map((tagItem, index) => (
                    <Chip
                      key={index}
                      avatar={
                        <Avatar
                          src={
                            import.meta.env.VITE_API_URL + tagItem.tag.fileUrl
                          }
                          alt={tagItem.tag.tagName}
                        />
                      }
                      label={`#${tagItem.tag.tagName}`}
                      variant="outlined"
                      sx={{
                        color: "#fff",
                        borderColor: "#444",
                        backgroundColor: "#222",
                        fontSize: "0.85rem",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              <hr
                style={{
                  backgroundColor: "#30363f",
                  height: "1px",
                  border: "none",
                }}
              />
            </>
          )}
          <div
            className="content-text"
            dangerouslySetInnerHTML={{ __html: board.boardContent }}
          />
        </div>

        {/* 2025년 7월 14일 수정됨 - 하단 좋아요 버튼도 단순화 */}
        <div className="detail-actions-bottom">
          <button
            onClick={handleLike}
            className={`like-button ${isLiked ? "liked" : ""}`}
            disabled={isLiked}
          >
            <ThumbUpAltOutlinedIcon />
            좋아요 {board.boardLike}
          </button>
        </div>
      </div>

      {/* 댓글 */}
      <CommentSection
        boardNo={boardNo}
        comments={comments}
        setComments={setComments}
        onRefresh={loadComments}
        loadAllComments={true}
      />

      {/* 유저 프로필 팝업 */}
      <UserProfilePopup
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={selectedUser}
      />

      {/* 신고 모달 */}
      <ReportModal
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default BoardDetail;
