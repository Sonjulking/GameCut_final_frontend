import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Box, Button, Chip, IconButton, Stack } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CommentSection from "./CommentSection.jsx"; // 새로 만든 컴포넌트 import
import "../styles/boardDetail.css";
import axiosInstance from "../lib/axiosInstance.js";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // 댓글 관련 상태 - CommentSection으로 전달할 예정
  const [comments, setComments] = useState([]);

  // boardTypeNo를 타입명으로 변환하는 함수
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

  // 게시글 데이터 로드
  const loadBoardDetail = async () => {
    console.log(boardNo);
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8081/board/detail/${boardNo}`
      );
      setBoard(response.data);

      // board에 comments가 포함되어 있다면 바로 설정
      if (response.data.comments) {
        console.log("📋 board에서 가져온 comments:", response.data.comments);
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

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const response = await axiosInstance.post(`/board/like/${boardNo}`);
      setIsLiked(!isLiked);
      setBoard((prev) => ({
        ...prev,
        boardLike: isLiked ? prev.boardLike - 1 : prev.boardLike + 1,
      }));
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  // 게시글 삭제
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

  // 게시글 수정
  const handleEdit = () => {
    navigate(`/board/edit/${boardNo}`);
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    navigate("/board/list");
  };

  useEffect(() => {
    if (boardNo) {
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
      {/* 헤더 영역 */}
      <div className="detail-header">
        <button onClick={handleBackToList} className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
          </svg>
          목록으로
        </button>
        <div className="detail-actions">
          <button onClick={handleEdit} className="edit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            수정
          </button>
          <button onClick={handleDelete} className="board-delete-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
            </svg>
            삭제
          </button>
        </div>
      </div>

      {/* 게시글 정보 */}
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
              <span className="author-name">
                작성자: {board.user.userNickname}
              </span>
              <span className="create-date">{board.boardCreateDate}</span>
            </div>
            <div className="board-stats">
              <span className="stat-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                {board.boardCount}
              </span>
              <button
                onClick={toggleLike}
                className={`stat-item like-btn ${isLiked ? "liked" : ""}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {board.boardLike}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-body">
          {board.boardTypeNo === 3 ? (
            <>
              <video
                src={
                  `${import.meta.env.VITE_API_URL}` +
                  board.video?.attachFile.fileUrl
                }
                style={{ width: "100%" }}
                controls={true}
              ></video>
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
                        color: "#fff", // 글씨 흰색
                        borderColor: "#444", // 테두리 어두운 회색
                        backgroundColor: "#222", // 바탕 진한 회색
                        "& .MuiChip-avatar": {
                          width: 20,
                          height: 20,
                        },
                        "&:hover": {
                          backgroundColor: "#333",
                        },
                        fontSize: "0.85rem",
                        fontWeight: 500,
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
          ) : null}
          <div
            className="content-text"
            dangerouslySetInnerHTML={{ __html: board.boardContent }}
          />
        </div>

        {/* 좋아요 버튼 */}
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

      {/* 댓글 섹션을 별도 컴포넌트로 분리 */}
      <CommentSection
        boardNo={boardNo}
        comments={comments}
        setComments={setComments}
        onRefresh={loadBoardDetail}
      />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default BoardDetail;
