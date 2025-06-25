import axios from "axios";
import React, { useState } from "react";

const CommentSection = ({ boardNo, comments, setComments }) => {
  const [showReplies, setShowReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({}); // 대댓글 입력창 표시 상태

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

  // 각 댓글별 대댓글 입력 상태를 객체로 관리
  const [replyInputs, setReplyInputs] = useState({});

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

  // 댓글 추가
  const handleAddComment = async () => {
    if (!inputComment.commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comment`,
        inputComment,
        axiosConfig
      );
      setComments([...comments, response.data]);
      setInputComment({ boardNo, commentContent: "" });
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
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
      const token = localStorage.getItem("token");
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

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comment`,
        requestData,
        axiosConfig
      );

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
                  <img
                    src="/src/assets/img/main/icons/admin.jpg"
                    alt="profile"
                    className="bd-comment-profile-img"
                  />
                  <div className="bd-comment-info">
                    <span className="bd-comment-nickname">
                      {comment.user.userNickname}
                    </span>
                    <span className="bd-comment-date">
                      {new Date(comment.commentCreateDate).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="bd-reply-insert-button"
                    onClick={() => toggleReplyInput(comment.commentNo)}
                  >
                    {showReplyInput[comment.commentNo] ? "취소" : "답글달기"}
                  </div>
                </div>
                <p className="bd-comment-content">{comment.commentContent}</p>

                {/* 대댓글 입력창 - 조건부 렌더링 */}
                {showReplyInput[comment.commentNo] && (
                  <div className="bd-reply-input-area">
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
                      className="bd-reply-input"
                    />
                    <button
                      onClick={() => handleAddCoComment(comment.commentNo)}
                      className="bd-comment-submit-btn"
                    >
                      대댓글 작성
                    </button>
                  </div>
                )}

                {/* 대댓글 */}
                {(() => {
                  // 현재 댓글의 대댓글 개수 계산
                  const replyCount = comments.filter(
                    (reply) =>
                      reply.parentComment &&
                      reply.parentComment.commentNo === comment.commentNo
                  ).length;

                  // 대댓글이 없으면 아무것도 표시하지 않음
                  if (replyCount === 0) return null;

                  return (
                    <div>
                      {/* 답글 개수 표시 및 토글 버튼 */}
                      <div
                        className="bd-reply-toggle-btn"
                        onClick={() => toggleReplies(comment.commentNo)}
                      >
                        {showReplies[comment.commentNo]
                          ? "답글 닫기"
                          : `답글 ${replyCount}개`}
                      </div>
                      {/* 대댓글 내용 - 조건부 렌더링 */}
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
                                    <span className="bd-reply-arrow">↳</span>
                                    <img
                                      src="/src/assets/img/main/icons/admin.jpg"
                                      alt="profile"
                                      className="bd-comment-profile-img bd-small"
                                    />
                                    <div className="bd-comment-info">
                                      <span className="bd-comment-nickname">
                                        {reply.user.userNickname}
                                      </span>
                                      <span className="bd-comment-date">
                                        {new Date(
                                          reply.commentCreateDate
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="bd-comment-content bd-reply-content-text">
                                    {reply.commentContent}
                                  </p>
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
    </div>
  );
};

export default CommentSection;
