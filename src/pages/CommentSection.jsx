import axios from "axios";
import React, { useState } from "react";
import Cookie from "js-cookie";
import axiosInstance from "../lib/axiosInstance";
import { useEffect } from "react";
import UserProfilePopup from "../pages/UserProfilePopup";
import { useSelector } from "react-redux";

const CommentSection = ({ boardNo, comments, setComments, onRefresh }) => {
  const [showReplies, setShowReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({}); // 대댓글 입력창 표시 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 수정 모드 상태 관리
  const [editMode, setEditMode] = useState({}); // 어떤 댓글이 수정 모드인지
  const [editContent, setEditContent] = useState({}); // 수정 중인 댓글 내용

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 댓글 관련 상태
  const [inputComment, setInputComment] = useState({
    boardNo: boardNo,
    commentContent: "",
  });
  const [inputCoComment, setInputCoComment] = useState({
    boardNo: boardNo,
    commentContent: "",
    parentComment: null, // 객체로 변경 (숫자가 아닌 전체 댓글 객체를 저장)
  });

  const [commentLikeStates, setCommentLikeStates] = useState({});

  // 각 댓글별 대댓글 입력 상태를 객체로 관리
  const [replyInputs, setReplyInputs] = useState({});

  const toggleReplies = (commentNo) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentNo]: !prev[commentNo],
    }));
  };

  //닉네임클릭핸들러
  const handleProfileClick = async (userNo) => {
    try {
      const res = await axiosInstance.get(`/user/${userNo}`);
      setSelectedUser(res.data);
      setProfileOpen(true);
    } catch (err) {
      console.error("유저 정보 불러오기 실패", err);
      alert("유저 정보를 불러올 수 없습니다.");
    }
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

  // 수정 모드 토글
  const toggleEditMode = (commentNo, currentContent) => {
    setEditMode((prev) => ({
      ...prev,
      [commentNo]: !prev[commentNo],
    }));

    // 수정 모드로 진입할 때 현재 댓글 내용을 설정
    if (!editMode[commentNo]) {
      setEditContent((prev) => ({
        ...prev,
        [commentNo]: currentContent,
      }));
    }
  };

  // 수정 내용 변경 핸들러
  const handleEditContentChange = (commentNo, value) => {
    setEditContent((prev) => ({
      ...prev,
      [commentNo]: value,
    }));
  };

  // 대댓글 입력값 변경 핸들러
  const handleReplyInputChange = (commentNo, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentNo]: value,
    }));
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!inputComment.commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요");
      return;
    }
    try {
      const response = await axiosInstance.post(`/comment`, inputComment);
      setComments([...comments, response.data]);
      setInputComment({ boardNo, commentContent: "" });
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    }
  };

  // 댓글 수정
  const handleEditComment = async (commentNo) => {
    const newContent = editContent[commentNo];

    if (!newContent || !newContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const token = Cookie.get("accessToken");
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axiosInstance.put(`/comment/${commentNo}`, {
        commentContent: newContent,
      });

      // 성공 시 댓글 목록 업데이트
      const updatedComments = comments.map((comment) =>
        comment.commentNo === commentNo
          ? { ...comment, commentContent: newContent }
          : comment
      );
      setComments(updatedComments);

      // 수정 모드 해제
      setEditMode((prev) => ({
        ...prev,
        [commentNo]: false,
      }));

      alert("댓글이 수정되었습니다.");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 대댓글 작성
  const handleAddCoComment = async (commentNo) => {
    const replyContent = replyInputs[commentNo];

    if (!replyContent || !replyContent.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const token = Cookie.get("accessToken");
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // 기존 comments 배열에서 부모 댓글 찾기
      const parentComment = comments.find(
        (comment) => comment.commentNo === commentNo
      );

      if (!parentComment) {
        alert("부모 댓글을 찾을 수 없습니다.");
        return;
      }

      console.log("찾은 부모 댓글:", parentComment);

      // 부모 댓글 정보를 포함한 대댓글 데이터 구성
      const requestData = {
        boardNo: boardNo,
        commentContent: replyContent,
        parentComment: parentComment, // comments 배열에서 찾은 부모 댓글 객체
      };

      console.log("대댓글 요청 데이터:", requestData);

      const response = await axiosInstance.post(`/comment`, requestData);

      setComments([...comments, response.data]);

      // 성공 후 해당 댓글의 입력창 초기화 및 숨기기
      setReplyInputs((prev) => ({
        ...prev,
        [commentNo]: "",
      }));
      setShowReplyInput((prev) => ({
        ...prev,
        [commentNo]: false,
      }));
    } catch (error) {
      console.error("대댓글 등록 실패:", error);
      alert("대댓글 등록에 실패했습니다.");
    }
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

  // 수정 모드에서 Enter 키 처리
  const handleEditKeyPress = (e, commentNo) => {
    if (e.key === "Enter") {
      handleEditComment(commentNo);
    }
  };

  const deleteComment = async (commentNo) => {
    if (window.confirm("댓글을 정말 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/comment/${commentNo}`);
        alert("댓글이 삭제되었습니다.");

        // 🔥 부모 컴포넌트의 새로고침 함수 호출
        if (onRefresh) {
          console.log("실행은됨");
          await onRefresh();
        }
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCommentLike = async (commentNo) => {
    try {
      const isCurrentlyLiked = commentLikeStates[commentNo] || false;
      // API 호출 - 좋아요 상태에 따라 다른 엔드포인트 호출
      if (isCurrentlyLiked) {
        await axiosInstance.post(`/comment/unlike/${commentNo}`);
      } else {
        await axiosInstance.post(`/comment/like/${commentNo}`);
      }

      // 로컬 상태 업데이트
      setCommentLikeStates((prev) => ({
        ...prev,
        [commentNo]: !isCurrentlyLiked,
      }));

      // 댓글 목록의 좋아요 수 업데이트
      setComments((prev) =>
        prev.map((comment) =>
          comment.commentNo === commentNo
            ? {
                ...comment,
                likeCount: isCurrentlyLiked
                  ? (comment.likeCount || 1) - 1
                  : (comment.likeCount || 0) + 1,
                isLiked: !isCurrentlyLiked,
              }
            : comment
        )
      );

      console.log(
        `댓글 ${commentNo} 좋아요 ${isCurrentlyLiked ? "취소" : "추가"} 완료`
      );
    } catch (error) {
      console.error("댓글 좋아요 처리 실패:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const initializeCommentLikeStates = () => {
    const likeStates = {};
    comments.forEach((comment) => {
      likeStates[comment.commentNo] = comment.isLiked || false;
    });
    setCommentLikeStates(likeStates);
  };

  useEffect(() => {
    if (comments.length > 0) {
      initializeCommentLikeStates();
    }
  }, [comments]);

  return (
    <div className="bd-comment-section">
      <div className="bd-comment-header">
        <h3>댓글 {comments.length}개</h3>
      </div>

      {/* 댓글 입력 */}
      <div className="bd-comment-input-area">
        <div className="bd-comment-input-wrapper">
          <input
            type="text"
            placeholder="댓글을 입력하세요..."
            value={inputComment.commentContent}
            onChange={(e) =>
              setInputComment({
                ...inputComment,
                commentContent: e.target.value,
              })
            }
            onKeyPress={handleKeyPress}
            className="bd-comment-input-field"
          />
          <button onClick={handleAddComment} className="bd-comment-submit-btn">
            댓글 작성
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="bd-comment-list">
        {comments.length > 0 ? (
          comments
            .filter((comment) => !comment.parentComment)
            .map((comment) => (
              <div key={comment.commentNo} className="bd-comment-item">
                <div className="bd-comment-user-info">
                  <div className="bd-user-left">
                    {comment.commentDeleteDate ? (
                      <img
                        src="/src/assets/img/main/icons/profile_icon.png"
                        alt="profile"
                        className="bd-comment-profile-img"
                      />
                    ) : (
                      <img
                        src="/src/assets/img/main/icons/admin.jpg" // 이거 나중에 유저사진으로 바꿔야함
                        alt="profile"
                        className="bd-comment-profile-img"
                      />
                    )}
                    <div className="bd-comment-info">
                      <span
                        className="bd-comment-nickname"
                        onClick={() => handleProfileClick(comment.user.userNo)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {/* 🔥 삭제된 댓글인지 확인 */}
                        {comment.commentDeleteDate
                          ? ""
                          : comment.user.userNickname}
                      </span>
                      <span className="bd-comment-date">
                        {new Date(comment.commentCreateDate).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 🔥 삭제되지 않은 댓글만 버튼 표시 */}
                  {!comment.commentDeleteDate && (
                    <div className="bd-actions-right">
                      <div
                        className="bd-reply-delete-button"
                        onClick={() => {
                          if (editMode[comment.commentNo]) {
                            handleEditComment(comment.commentNo);
                          } else {
                            toggleEditMode(
                              comment.commentNo,
                              comment.commentContent
                            );
                          }
                        }}
                      >
                        {editMode[comment.commentNo] ? "완료" : "수정"}
                      </div>
                      <div
                        className="bd-reply-delete-button"
                        onClick={() => deleteComment(comment.commentNo)}
                      >
                        삭제
                      </div>
                      <div
                        className="bd-reply-insert-button"
                        onClick={() => toggleReplyInput(comment.commentNo)}
                      >
                        {showReplyInput[comment.commentNo]
                          ? "취소"
                          : "답글달기"}
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔥 댓글 내용 - 수정 모드에 따라 다르게 표시 */}
                {/* 기존 댓글 내용 부분을 이렇게 수정 */}
                {editMode[comment.commentNo] ? (
                  <div className="bd-comment-edit-area">
                    <input
                      type="text"
                      value={editContent[comment.commentNo] || ""}
                      onChange={(e) =>
                        handleEditContentChange(
                          comment.commentNo,
                          e.target.value
                        )
                      }
                      onKeyPress={(e) =>
                        handleEditKeyPress(e, comment.commentNo)
                      }
                      className="bd-comment-edit-input"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <p className="bd-comment-content">
                      {comment.commentDeleteDate ? (
                        <span className="deleted-comment">
                          삭제된 댓글입니다.
                        </span>
                      ) : (
                        comment.commentContent
                      )}
                    </p>

                    {/* 삭제되지 않은 댓글에만 좋아요 버튼 표시 */}
                    {!comment.commentDeleteDate && (
                      <div className="bd-comment-actions">
                        <button
                          className={`bd-like-button ${
                            comment.isLiked ? "liked" : ""
                          }`}
                          onClick={() => handleCommentLike(comment.commentNo)}
                        >
                          <svg
                            className="bd-like-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43 c1.06,0,1.97-0.67,2.32-1.66l1.9-5.49c0.14-0.41,0.21-0.84,0.21-1.28V12C21.86,11.45,21.38,11,20.81,11L18.77,11z" />
                          </svg>
                          <span className="bd-like-count">
                            {comment.commentLike || 0}
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* 🔥 삭제되지 않은 댓글만 대댓글 입력창 표시 */}
                {!comment.commentDeleteDate &&
                  showReplyInput[comment.commentNo] && (
                    <div className="bd-reply-input-area">
                      <div className="bd-reply-input-wrapper">
                        <input
                          type="text"
                          placeholder="대댓글을 입력하세요..."
                          value={replyInputs[comment.commentNo] || ""}
                          onChange={(e) =>
                            handleReplyInputChange(
                              comment.commentNo,
                              e.target.value
                            )
                          }
                          onKeyPress={(e) =>
                            handleReplyKeyPress(e, comment.commentNo)
                          }
                          className="bd-reply-input-field"
                        />
                        <button
                          onClick={() => handleAddCoComment(comment.commentNo)}
                          className="bd-reply-submit-btn"
                        >
                          답글 작성
                        </button>
                      </div>
                    </div>
                  )}

                {/* 대댓글 부분도 동일하게 수정 기능 추가 */}
                {(() => {
                  const replyCount = comments.filter(
                    (reply) =>
                      reply.parentComment &&
                      reply.parentComment.commentNo === comment.commentNo
                  ).length;

                  if (replyCount === 0) return null;

                  return (
                    <div>
                      <div
                        className="bd-reply-toggle-btn"
                        onClick={() => toggleReplies(comment.commentNo)}
                      >
                        {showReplies[comment.commentNo]
                          ? "답글 닫기"
                          : `답글 ${replyCount}개`}
                      </div>
                      {showReplies[comment.commentNo] && (
                        <div className="bd-replies-container">
                          {comments
                            .filter(
                              (reply) =>
                                reply.parentComment &&
                                reply.parentComment.commentNo ===
                                  comment.commentNo
                            )
                            .map((reply, replyIndex) => (
                              <div key={replyIndex} className="bd-reply-item">
                                <div className="bd-reply-content">
                                  <div className="bd-comment-user-info">
                                    <div className="bd-user-left">
                                      <span className="bd-reply-arrow">↳</span>
                                      {reply.commentDeleteDate ? (
                                        <img
                                          src="/src/assets/img/main/icons/profile_icon.png"
                                          alt="profile"
                                          className="bd-comment-profile-img"
                                        />
                                      ) : (
                                        <img
                                          src="/src/assets/img/main/icons/admin.jpg"
                                          alt="profile"
                                          className="bd-comment-profile-img bd-small"
                                        />
                                      )}
                                      <div className="bd-comment-info">
                                        <span
                                          className="bd-comment-nickname"
                                          onClick={() =>
                                            handleProfileClick(
                                              reply.user.userNo
                                            )
                                          }
                                          style={{
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                          }}
                                        >
                                          {/* 🔥 대댓글도 동일하게 */}
                                          {reply.commentDeleteDate
                                            ? ""
                                            : reply.user.userNickname}
                                        </span>
                                        <span className="bd-comment-date">
                                          {new Date(
                                            reply.commentCreateDate
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 🔥 대댓글도 삭제되지 않은 경우만 버튼 표시 */}
                                    {!reply.commentDeleteDate && (
                                      <div className="bd-actions-right">
                                        <div
                                          className="bd-reply-delete-button"
                                          onClick={() => {
                                            if (editMode[reply.commentNo]) {
                                              handleEditComment(
                                                reply.commentNo
                                              );
                                            } else {
                                              toggleEditMode(
                                                reply.commentNo,
                                                reply.commentContent
                                              );
                                            }
                                          }}
                                        >
                                          {editMode[reply.commentNo]
                                            ? "완료"
                                            : "수정"}
                                        </div>
                                        <div
                                          className="bd-reply-delete-button"
                                          onClick={() =>
                                            deleteComment(reply.commentNo)
                                          }
                                        >
                                          삭제
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* 🔥 대댓글 내용도 수정 모드에 따라 다르게 표시 */}
                                  {/* 대댓글 내용 부분 */}
                                  {editMode[reply.commentNo] ? (
                                    <div className="bd-comment-edit-area">
                                      <input
                                        type="text"
                                        value={
                                          editContent[reply.commentNo] || ""
                                        }
                                        onChange={(e) =>
                                          handleEditContentChange(
                                            reply.commentNo,
                                            e.target.value
                                          )
                                        }
                                        onKeyPress={(e) =>
                                          handleEditKeyPress(e, reply.commentNo)
                                        }
                                        className="bd-comment-edit-input"
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <p className="bd-comment-content bd-reply-content-text">
                                        {reply.commentDeleteDate ? (
                                          <span className="deleted-comment">
                                            삭제된 댓글입니다.
                                          </span>
                                        ) : (
                                          reply.commentContent
                                        )}
                                      </p>

                                      {/* 삭제되지 않은 대댓글에만 좋아요 버튼 표시 */}
                                      {!reply.commentDeleteDate && (
                                        <div className="bd-reply-actions">
                                          <button
                                            className={`bd-like-button ${
                                              reply.isLiked ? "liked" : ""
                                            }`}
                                            onClick={() =>
                                              handleCommentLike(reply.commentNo)
                                            }
                                          >
                                            <svg
                                              className="bd-like-icon"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                            >
                                              <path d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43 c1.06,0,1.97-0.67,2.32-1.66l1.9-5.49c0.14-0.41,0.21-0.84,0.21-1.28V12C21.86,11.45,21.38,11,20.81,11L18.77,11z" />
                                            </svg>
                                            <span className="bd-like-count">
                                              {reply.likeCount || 0}
                                            </span>
                                          </button>
                                        </div>
                                      )}
                                    </>
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
            ))
        ) : (
          <div className="bd-no-comments">
            <p>첫 번째 댓글을 작성해보세요!</p>
          </div>
        )}
      </div>

      {/* ✅ 유저 프로필 팝업 추가 */}
      <UserProfilePopup
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default CommentSection;
