// 2025-07-03 16:15 생성됨
// 2025-07-17 수정됨 - 유저 정보 팝업 기능 및 CSS 스타일 개선
// src/components/CommentSection.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CloseIcon from "@mui/icons-material/Close";
import { formatRelativeTimeKo } from "../../util/timeFormatUtil.js";
import { useSelector } from "react-redux";
import axiosInstance from "../../lib/axiosInstance.js";
// 2025-07-17 수정됨 - 유저 정보 팝업 컴포넌트 추가
import UserProfilePopup from "../../pages/UserProfilePopup";
// 2025-07-17 수정됨 - 기본 프로필 아이콘 import 추가
import profileIconImg from "../../assets/img/main/icons/profile_icon.png";

const CommentSection = ({
  boardNo,
  isOpen,
  comments,
  videoId,
  onClose,
  onAddComment,
  hasMoreComments,
  isLoadingComments,
  onLoadMore,
  totalCount,
}) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user); // 2025-07-17 수정됨 - user 정보 추가

  const [inputComment, setInputComment] = useState({
    boardNo: boardNo,
    commentContent: "",
  });
  const [lastCommentCount, setLastCommentCount] = useState(0); // 이전 댓글 개수 추적
  const [isNewCommentAdded, setIsNewCommentAdded] = useState(false); // 새 댓글 작성 여부
  const [likedComments, setLikedComments] = useState(new Set()); // 좋아요한 댓글들
  const [commentLikes, setCommentLikes] = useState({}); // 댓글별 좋아요 수

  // 2025-07-17 수정됨 - 유저 정보 팝업 관련 상태 추가
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 대댓글 관련 상태 추가
  const [showReplies, setShowReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const commentListRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // 댓글 좋아요 상태 초기화 - detail.jsx 방식과 동일하게 수정
  useEffect(() => {
    console.log("댓글 데이터 받음:", comments);

    const likedSet = new Set();
    const likesCount = {};

    comments.forEach((comment) => {
      // 좋아요 수 설정
      likesCount[comment.commentNo] = comment.commentLike || 0;

      // 좋아요 상태 설정 (서버에서 받은 isLikedByCurrentUser 사용)
      console.log(
        `댓글 ${comment.commentNo} 좋아요 상태:`,
        comment.isLikedByCurrentUser
      );
      if (comment.isLikedByCurrentUser) {
        likedSet.add(comment.commentNo);
      }
    });

    console.log("좋아요한 댓글들:", Array.from(likedSet));
    console.log("댓글별 좋아요 수:", likesCount);

    setLikedComments(likedSet);
    setCommentLikes(likesCount);
  }, [comments]);

  // 새 댓글 작성 시에만 맨 위로 스크롤
  useEffect(() => {
    const listEl = commentListRef.current;
    if (listEl && isNewCommentAdded && comments.length > lastCommentCount) {
      // 새 댓글 작성한 경우에만 맨 위로 스크롤
      listEl.scrollTop = 0;
      setIsNewCommentAdded(false);
    }
    setLastCommentCount(comments.length);
  }, [comments.length, isNewCommentAdded, lastCommentCount]);

  // 무한스크롤 설정
  useEffect(() => {
    if (!isOpen || !hasMoreComments) return;

    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingComments) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreElement);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, hasMoreComments, isLoadingComments, onLoadMore]);

  // 2025-07-17 수정됨 - 닉네임 클릭 핸들러 추가
  const handleProfileClick = async (userNo) => {
    if (!isLoggedIn) {
      alert("로그인 후 프로필을 확인할 수 있습니다.");
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/user/${userNo}`);
      setSelectedUser(res.data);
      setProfileOpen(true);
    } catch (err) {
      console.error("유저 정보 불러오기 실패", err);
      alert("유저 정보를 불러올 수 없습니다.");
    }
  };

  // 대댓글 보기/숨기기 토글
  const toggleReplies = (commentNo) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentNo]: !prev[commentNo],
    }));
  };

  // 대댓글 입력창 토글
  const toggleReplyInput = (commentNo) => {
    setShowReplyInput((prev) => ({
      ...prev,
      [commentNo]: !prev[commentNo],
    }));

    // 입력창을 열 때 해당 댓글의 입력 상태 초기화
    if (!showReplyInput[commentNo]) {
      setReplyInputs((prev) => ({
        ...prev,
        [commentNo]: "",
      }));
    }
  };

  // 대댓글 입력값 변경 핸들러
  const handleReplyInputChange = (commentNo, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentNo]: value,
    }));
  };

  // 댓글 좋아요 토글 - detail.jsx 방식과 동일하게 수정
  const handleCommentLike = async (commentNo) => {
    if (!isLoggedIn) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    try {
      const isCurrentlyLiked = likedComments.has(commentNo);

      // 해당 댓글 정보 찾기 (포인트 지급용)
      const targetComment = comments.find(
        (comment) => comment.commentNo === commentNo
      );

      // detail.jsx와 동일한 방식으로 API 호출
      if (isCurrentlyLiked) {
        // 좋아요 취소
        await axiosInstance.post(`/api/comment/unlike/${commentNo}`);
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentNo);
          return newSet;
        });
        setCommentLikes((prev) => ({
          ...prev,
          [commentNo]: Math.max(0, (prev[commentNo] || 0) - 1),
        }));
      } else {
        // 좋아요 추가
        await axiosInstance.post(`/api/comment/like/${commentNo}`);
        setLikedComments((prev) => new Set(prev).add(commentNo));
        setCommentLikes((prev) => ({
          ...prev,
          [commentNo]: (prev[commentNo] || 0) + 1,
        }));

        // 2025-07-10 수정됨 - 댓글 좋아요 포인트 지급 로직 추가
        // 새로 좋아요를 누른 경우에만 포인트 지급
        if (
          targetComment &&
          targetComment.user &&
          user &&
          targetComment.user.userNo !== user.userNo
        ) {
          try {
            const pointData = new FormData();
            pointData.append("point", 3);
            pointData.append("reason", "댓글 좋아요 획득");
            pointData.append("recievedUserNo", targetComment.user.userNo);

            await axiosInstance.post("/user/updatePoint", pointData);
            console.log(
              "댓글 좋아요 포인트 지급 완료:",
              targetComment.user.userNo
            );
          } catch (pointError) {
            console.error("댓글 좋아요 포인트 지급 실패:", pointError);
          }
        }
      }

      // 서버 상태 재확인을 위한 알림 (선택사항)
      console.log(
        `댓글 ${commentNo} 좋아요 ${isCurrentlyLiked ? "취소" : "추가"} 완료`
      );
    } catch (error) {
      console.error("댓글 좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");

      // 에러 발생 시 상태 재확인
      try {
        const response = await axiosInstance.post(
          `/api/comment/isLike/${commentNo}`
        );
        if (response.data !== likedComments.has(commentNo)) {
          if (response.data) {
            setLikedComments((prev) => new Set(prev).add(commentNo));
          } else {
            setLikedComments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(commentNo);
              return newSet;
            });
          }
        }
      } catch (recheckError) {
        console.error("좋아요 상태 재확인 실패:", recheckError);
      }
    }
  };

  // 대댓글 작성
  const handleAddCoComment = async (commentNo) => {
    const replyContent = replyInputs[commentNo];

    if (!replyContent || !replyContent.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }

    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요");
      return;
    }

    try {
      // 기존 comments 배열에서 부모 댓글 찾기
      const parentComment = comments.find(
        (comment) => comment.commentNo === commentNo
      );

      if (!parentComment) {
        alert("부모 댓글을 찾을 수 없습니다.");
        return;
      }

      // 부모 댓글 정보를 포함한 대댓글 데이터 구성
      const requestData = {
        boardNo: boardNo,
        commentContent: replyContent,
        parentComment: parentComment, // comments 배열에서 찾은 부모 댓글 객체
      };

      const response = await axiosInstance.post(`/api/comment`, requestData);

      onAddComment(response.data); // 댓글 추가!

      // 성공 후 해당 댓글의 입력창 초기화 및 숨기기
      setReplyInputs((prev) => ({
        ...prev,
        [commentNo]: "",
      }));
      setShowReplyInput((prev) => ({
        ...prev,
        [commentNo]: false,
      }));

      // 대댓글 작성 후 대댓글 목록 자동 열기
      setShowReplies((prev) => ({
        ...prev,
        [commentNo]: true,
      }));
    } catch (error) {
      console.error("대댓글 등록 실패:", error);
      alert("대댓글 등록에 실패했습니다.");
    }
  };

  const handleAddComment = () => {
    if (!isLoggedIn) {
      alert("로그인 후 댓글 작성이 가능합니다.");
      return;
    }

    if (!inputComment.commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    axiosInstance
      .post(`/api/comment`, inputComment)
      .then((res) => {
        setIsNewCommentAdded(true); // 새 댓글 작성 플래그 설정
        onAddComment(res.data); // 댓글 추가!
        setInputComment({ boardNo, commentContent: "" }); // 입력창 초기화
      })
      .catch((err) => {
        console.error("댓글 등록 실패", err);
        alert("댓글작성이 실패했습니다.");
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  const handleReplyKeyPress = (e, commentNo) => {
    if (e.key === "Enter") {
      handleAddCoComment(commentNo);
    }
  };

  return (
    <div
      id={`comments-for-video-${videoId}`}
      className={`main_comment_wrapper ${isOpen ? "comment-open" : ""}`}
    >
      <div className="comment-title">
        댓글 {totalCount > 0 && `(${totalCount})`}
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className="comment-list" ref={commentListRef}>
        {/* 댓글이 없는 경우 */}
        {comments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <p>댓글이 없습니다.</p>
            <p style={{ fontSize: "0.8rem", color: "#999" }}>
              첫 번째 댓글을 작성해보세요!
            </p>
          </div>
        ) : (
          <>
            {/* 댓글 목록 - 최상위 댓글만 표시 */}
            {comments
              .filter((comment) => !comment.parentComment)
              .map((c, idx) => (
                <div className="comment" key={c.commentNo || idx}>
                  <div className="bd-comment-user-info">
                    <div className="bd-user-left">
                      <img
                        src={
                          // 2025-07-17 수정됨 - 기본 프로필 아이콘 사용
                          !c.commentDeleteDate &&
                          c.user.photo &&
                          c.user.photo.attachFile
                            ? import.meta.env.VITE_API_URL +
                              c.user.photo.attachFile.fileUrl
                            : profileIconImg
                        }
                        alt="profile"
                        className="bd-comment-profile-img"
                      />
                      <div className="bd-comment-info">
                        <span
                          className="bd-comment-nickname"
                          onClick={() => {
                            // 2025-07-17 수정됨 - 닉네임 클릭 이벤트 추가
                            if (!c.commentDeleteDate) {
                              handleProfileClick(c.user.userNo);
                            }
                          }}
                          style={{
                            cursor: c.commentDeleteDate ? "default" : "pointer",
                            textDecoration: c.commentDeleteDate ? "none" : "underline",
                          }}
                        >
                          {/* 2025-07-14 수정됨 - 삭제된 댓글 닉네임 처리 */}
                          {c.commentDeleteDate ? "" : c.user.userNickname}
                        </span>
                        <span className="bd-comment-date">
                          {formatRelativeTimeKo(c.commentCreateDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="comment-content">
                    {/* 2025-07-14 수정됨 - 삭제된 댓글 내용 처리 */}
                    {c.commentDeleteDate ? (
                      <span className="deleted-comment">
                        삭제된 댓글입니다.
                      </span>
                    ) : (
                      c.commentContent
                    )}
                  </p>
                  {/* 2025-07-17 수정됨 - pages와 동일한 스타일로 액션 버튼 변경 */}
                  {!c.commentDeleteDate && (
                    <>
                      <div className="bd-comment-actions">
                        <button
                          className={`bd-like-button ${
                            likedComments.has(c.commentNo) ? "liked" : ""
                          }`}
                          onClick={() => handleCommentLike(c.commentNo)}
                          disabled={likedComments.has(c.commentNo)}
                        >
                          <svg
                            className="bd-like-icon"
                            viewBox="0 0 24 24"
                            fill={
                              likedComments.has(c.commentNo)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span className="bd-like-count">
                            {commentLikes[c.commentNo] || 0}
                          </span>
                        </button>
                      </div>

                      <div className="bd-actions-right">
                        <div
                          className="bd-reply-insert-button"
                          onClick={() => toggleReplyInput(c.commentNo)}
                        >
                          {showReplyInput[c.commentNo] ? "취소" : "답글달기"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 2025-07-17 수정됨 - pages와 동일한 스타일로 대댓글 입력창 변경 */}
                  {!c.commentDeleteDate && showReplyInput[c.commentNo] && (
                    <div className="bd-reply-input-area">
                      <div className="bd-reply-input-wrapper">
                        <input
                          type="text"
                          placeholder="대댓글을 입력하세요..."
                          value={replyInputs[c.commentNo] || ""}
                          onChange={(e) =>
                            handleReplyInputChange(c.commentNo, e.target.value)
                          }
                          onKeyPress={(e) => handleReplyKeyPress(e, c.commentNo)}
                          className="bd-reply-input-field"
                        />
                        <button
                          onClick={() => handleAddCoComment(c.commentNo)}
                          className="bd-reply-submit-btn"
                        >
                          답글 작성
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 표시 부분 */}
                  {(() => {
                    const replyCount = comments.filter(
                      (reply) =>
                        reply.parentComment &&
                        reply.parentComment.commentNo === c.commentNo
                    ).length;

                    if (replyCount === 0) return null;

                    return (
                      <div style={{ marginTop: "12px" }}>
                        <div
                          className="bd-reply-toggle-btn"
                          onClick={() => toggleReplies(c.commentNo)}
                        >
                          {showReplies[c.commentNo]
                            ? "답글 닫기"
                            : `답글 ${replyCount}개`}
                        </div>

                        {showReplies[c.commentNo] && (
                          <div className="bd-replies-container">
                            {comments
                              .filter(
                                (reply) =>
                                  reply.parentComment &&
                                  reply.parentComment.commentNo === c.commentNo
                              )
                              .map((reply, replyIndex) => (
                                <div
                                  key={reply.commentNo || replyIndex}
                                  className="bd-reply-item"
                                >
                                  <div className="bd-reply-content">
                                    <div className="bd-comment-user-info">
                                      <div className="bd-user-left">
                                        <span className="bd-reply-arrow">↓</span>
                                        <img
                                          src={
                                            // 2025-07-17 수정됨 - 대댓글 기본 프로필 아이콘 사용
                                            !reply.commentDeleteDate &&
                                            reply.user.photo &&
                                            reply.user.photo.attachFile
                                              ? import.meta.env.VITE_API_URL +
                                                reply.user.photo.attachFile.fileUrl
                                              : profileIconImg
                                          }
                                          alt="profile"
                                          className="bd-comment-profile-img"
                                        />
                                        <div className="bd-comment-info">
                                          <span
                                            className="bd-comment-nickname"
                                            onClick={() => {
                                              // 2025-07-17 수정됨 - 대댓글 닉네임 클릭 이벤트 추가
                                              if (!reply.commentDeleteDate) {
                                                handleProfileClick(reply.user.userNo);
                                              }
                                            }}
                                            style={{
                                              cursor: reply.commentDeleteDate ? "default" : "pointer",
                                              textDecoration: reply.commentDeleteDate ? "none" : "underline",
                                            }}
                                          >
                                            {/* 2025-07-14 수정됨 - 대댓글 삭제된 댓글 닉네임 처리 */}
                                            {reply.commentDeleteDate
                                              ? ""
                                              : reply.user.userNickname}
                                          </span>
                                          <span className="bd-comment-date">
                                            {formatRelativeTimeKo(
                                              reply.commentCreateDate
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 대댓글 내용 */}
                                    <p className="bd-comment-content bd-reply-content-text">
                                      {/* 2025-07-14 수정됨 - 대댓글 삭제된 댓글 내용 처리 */}
                                      {reply.commentDeleteDate ? (
                                        <span className="deleted-comment">
                                          삭제된 댓글입니다.
                                        </span>
                                      ) : (
                                        reply.commentContent
                                      )}
                                    </p>

                                    {/* 2025-07-17 수정됨 - 대댓글 좋아요 버튼 pages 스타일로 변경 */}
                                    {!reply.commentDeleteDate && (
                                      <div className="bd-reply-actions">
                                        <button
                                          className={`bd-like-button ${
                                            likedComments.has(reply.commentNo)
                                              ? "liked"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleCommentLike(reply.commentNo)
                                          }
                                          disabled={likedComments.has(reply.commentNo)}
                                        >
                                          <svg
                                            className="bd-like-icon"
                                            viewBox="0 0 24 24"
                                            fill={
                                              likedComments.has(reply.commentNo)
                                                ? "currentColor"
                                                : "none"
                                            }
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                          </svg>
                                          <span className="bd-like-count">
                                            {commentLikes[reply.commentNo] || 0}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}

            {/* 무한스크롤 로딩 트리거 */}
            {hasMoreComments && (
              <div
                ref={loadMoreRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "16px",
                  minHeight: "60px",
                }}
              >
                {isLoadingComments ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CircularProgress size={20} sx={{ color: "#90caf9" }} />
                    <Typography variant="body2" style={{ color: "#ccc" }}>
                      댓글을 불러오는 중...
                    </Typography>
                  </div>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      color: "#90caf9",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={onLoadMore}
                  >
                    더 많은 댓글 보기
                  </Typography>
                )}
              </div>
            )}

            {/* 더 이상 댓글이 없을 때 - 조건 수정 */}
            {!hasMoreComments && comments.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                {comments.length <= 5
                  ? "마지막 댓글입니다."
                  : "모든 댓글을 확인했습니다."}
              </div>
            )}
          </>
        )}
      </div>

      <div className="comment-input">
        <input
          type="text"
          placeholder={
            isLoggedIn ? "댓글 작성" : "로그인 후 댓글이 작성가능합니다."
          }
          className="comment-input-field"
          value={inputComment.commentContent}
          onChange={(e) =>
            setInputComment({
              ...inputComment,
              commentContent: e.target.value,
            })
          }
          onKeyPress={handleKeyPress}
          disabled={!isLoggedIn}
        />
        <Button
          variant="outlined"
          onClick={handleAddComment}
          disabled={!isLoggedIn || !inputComment.commentContent.trim()}
          sx={{
            minWidth: "40px",
            height: "20px",
            padding: 0,
            color: "#90caf9",
            borderColor: "#90caf9",
            "&.Mui-disabled": {
              color: "#666",
              borderColor: "#666",
            },
          }}
        >
          <ArrowUpwardIcon fontSize="medium" />
        </Button>
      </div>

      {/* 2025-07-17 수정됨 - 유저 정보 팝업 추가 */}
      <UserProfilePopup
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default CommentSection;
