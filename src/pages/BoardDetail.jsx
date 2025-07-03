// 2025-07-03 16:10 생성됨
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Box, Button, Chip, IconButton, Stack } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import CommentSection from "./CommentSection.jsx";
import UserProfilePopup from "../pages/UserProfilePopup.jsx";
import "../styles/boardDetail.css";
import axiosInstance from "../lib/axiosInstance.js";
import ReportModal from "./ReportModal.jsx";
import {useSelector} from "react-redux"; // ✅ 신고 모달 import

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

  // ✅ 신고 모달 상태
  const [isReportOpen, setIsReportOpen] = useState(false);

  // ✅ 프로필 팝업 상태
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
      const response = await axiosInstance.get(`/board/detail/${boardNo}`); // axiosInstance 사용으로 변경
      setBoard(response.data);
      if (response.data.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      alert("게시글을 불러올 수 없습니다.");
      navigate("/board/list");
    } finally {
      setLoading(false);
    }
  };
  // 좋아요 여부 체크
  const checkLikeStatus = async () => {
    try {
      const response = await axiosInstance.post(`/board/isLike/${boardNo}`);
      setIsLiked(response.data); // true/false 값 설정
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
    }
  };

  const toggleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 좋아요가 가능합니다.")
      return;
    }
    try {
      {
        isLiked
          ? await axiosInstance.post(`/board/unlike/${boardNo}`)
          : await axiosInstance.post(`/board/like/${boardNo}`);
      }
      setIsLiked(!isLiked);
      setBoard((prev) => ({
        ...prev,
        boardLike: isLiked ? prev.boardLike - 1 : prev.boardLike + 1,
      }));
      loadBoardDetail();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(
          `${import.meta.env.VITE_API_URL}/board/${boardNo}`
        );
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

  // ✅ 신고 버튼 클릭 → 모달 열기
  const handleReport = () => {
    setIsReportOpen(true);
  };

  // ✅ 신고 제출
  const handleReportSubmit = async (content) => {
    try {
      const res = await axiosInstance.post("/report", {
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
    
    // 종횡비가 1보다 작으면 세로영상
    setIsVerticalVideo(aspectRatio < 1);
    console.log('비디오 종횡비:', { videoWidth, videoHeight, aspectRatio, isVertical: aspectRatio < 1 });
  };

  const handleProfileClick = async () => {
    try {
      const res = await axiosInstance.get(`/user/${board.user.userNo}`);
      setSelectedUser(res.data);
      setProfileOpen(true);
    } catch (error) {
      console.error("유저 정보 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (boardNo) {
      // 모바일에서 페이지 로드 시 상단으로 스크롤
      window.scrollTo(0, 0);
      
      checkLikeStatus();
      loadBoardDetail(); // 게시글만 로드하면 comments도 함께 옴
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
          <button onClick={handleEdit} className="edit-btn">
            수정
          </button>
          <button onClick={handleDelete} className="board-delete-btn">
            삭제
          </button>
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
              <span className="create-date">{board.boardCreateDate}</span>
            </div>
            <div className="board-stats">
              <span className="stat-item">조회수: {board.boardCount}</span>
              <button
                onClick={toggleLike}
                className={`stat-item like-btn ${isLiked ? "liked" : ""}`}
              >
                좋아요 {board.boardLike}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-body">
          {board.boardTypeNo === 3 && board.video?.attachFile && (
            <>
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <video
                  src={`${import.meta.env.VITE_API_URL}${
                    board.video.attachFile.fileUrl
                  }`}
                  onLoadedMetadata={handleVideoLoad}
                  style={{
                    width: isVerticalVideo ? "auto" : "100%",
                    maxWidth: isVerticalVideo ? "min(400px, 90vw)" : "100%", // 모바일에서 90vw 제한
                    maxHeight: isVerticalVideo ? "min(600px, 60vh)" : "70vh", // 모바일에서 60vh 제한
                    height: isVerticalVideo ? "auto" : "auto",
                    objectFit: "contain",
                    backgroundColor: "#000",
                    borderRadius: "8px",
                    border: "1px solid #333"
                  }}
                  controls
                  playsInline // 모바일에서 인라인 재생
                  preload="metadata" // 메타데이터만 먼저 로드
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

        <div className="detail-actions-bottom">
          <button
            onClick={toggleLike}
            className={`like-button ${isLiked ? "liked" : ""}`}
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
        onRefresh={loadBoardDetail}
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
