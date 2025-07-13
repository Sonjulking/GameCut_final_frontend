import axios from "axios";
import React, { useState } from "react";
import Cookie from "js-cookie";
import axiosInstance from "../lib/axiosInstance";
import { useEffect } from "react";
import UserProfilePopup from "../pages/UserProfilePopup";
import { useSelector } from "react-redux";

const CommentSection = ({
  boardNo,
  comments,
  setComments,
  onRefresh,
  loadAllComments = false,
}) => {
  const [showReplies, setShowReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({}); // 대댓글 입력창 표시 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 수정 모드 상태 관리
  const [editMode, setEditMode] = useState({}); // 어떤 댓글이 수정 모드인지
  const [editContent, setEditContent] = useState({}); // 수정 중인 댓글 내용

  const user = useSelector((state) => state.auth.user);
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

  // 2025년 7월 10일 수정됨 - 부모댓글 기준으로 페이징하도록 변경
  const [displayedParentComments, setDisplayedParentComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const COMMENTS_PER_PAGE = 5; // 한 번에 보여줄 부모댓글 수

  // 2025년 7월 10일 추가됨 - 모든 댓글 로드 함수
  const loadAllCommentsFromAPI = async () => {
    if (!loadAllComments) return; // loadAllComments가 true일 때만 실행

    try {
      const response = await axiosInstance.get(`/comment/board/${boardNo}/all`);
      setComments(response.data);
      console.log(`모든 댓글 로드 완료: ${response.data.length}개`);
    } catch (error) {
      console.error("모든 댓글 로드 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 모든 댓글 로드
  useEffect(() => {
    if (loadAllComments && boardNo) {
      loadAllCommentsFromAPI();
    }
  }, [boardNo, loadAllComments]);

  // 2025년 7월 10일 수정됨 - 부모댓글 기준 페이징 초기화
  useEffect(() => {
    if (comments.length > 0) {
      const parentComments = comments.filter(
        (comment) => !comment.parentComment
      );
      const initial = parentComments.slice(0, COMMENTS_PER_PAGE);
      setDisplayedParentComments(initial);
      setHasMore(parentComments.length > COMMENTS_PER_PAGE);
      setCurrentPage(1);
    }
  }, [comments]);

  // 2025년 7월 10일 수정됨 - 부모댓글 기준 더보기 버튼 클릭
  const loadMoreComments = () => {
    if (loading || !hasMore) return;

    setLoading(true);

    setTimeout(() => {
      const parentComments = comments.filter(
        (comment) => !comment.parentComment
      );
      const nextPage = currentPage;
      const startIndex = nextPage * COMMENTS_PER_PAGE;
      const endIndex = startIndex + COMMENTS_PER_PAGE;
      const newParentComments = parentComments.slice(startIndex, endIndex);

      setDisplayedParentComments((prev) => [...prev, ...newParentComments]);
      setCurrentPage(nextPage + 1);
      setHasMore(endIndex < parentComments.length);
      setLoading(false);
    }, 300); // 약간의 로딩 효과
  };

  const toggleReplies = (commentNo) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentNo]: !prev[commentNo],
    }));
  };

  //닉네임클릭핸들러
  const handleProfileClick = async (userNo) => {
    // 2025-07-13 16:10 생성됨
    // 로그인 상태 확인 후 API 호출
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
      const response = await axiosInstance.post(`/api/comment`, inputComment);

      // 2025년 7월 10일 수정됨 - loadAllComments에 따라 다르게 처리
      if (loadAllComments) {
        // 모든 댓글 다시 로드
        await loadAllCommentsFromAPI();
      } else {
        // 2025년 7월 10일 수정됨 - 부모댓글 기준 페이징 업데이트
        const updatedComments = [response.data, ...comments]; // 맨 앞에 추가
        setComments(updatedComments);

        // 부모댓글이라면 페이징도 업데이트
        if (!response.data.parentComment) {
          const newDisplayed = [
            response.data,
            ...displayedParentComments.slice(0, displayedParentComments.length),
          ];
          setDisplayedParentComments(newDisplayed);
        }
      }
      setInputComment({ boardNo, commentContent: "" });

      // 포인트 지급 로직
      const pointData = new FormData();
      pointData.append("point", 10);
      pointData.append("reason", "댓글작성");
      const res2 = await axiosInstance.post("/user/updatePoint", pointData);
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

      const response = await axiosInstance.put(`/api/comment/${commentNo}`, {
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

      const response = await axiosInstance.post(`/api/comment`, requestData);

      // 2025년 7월 10일 수정됨 - loadAllComments에 따라 다르게 처리
      if (loadAllComments) {
        // 모든 댓글 다시 로드
        await loadAllCommentsFromAPI();
      } else {
        // 2025년 7월 10일 수정됨 - 대댓글은 페이징에 영향주지 않음
        const updatedComments = [...comments, response.data]; // 맨 뒤에 추가
        setComments(updatedComments);

        // 대댓글은 displayedParentComments에 영향주지 않음 (부모댓글만 페이징대상)
      }

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
        await axiosInstance.delete(`/api/comment/${commentNo}`);
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
    if (!isLoggedIn) {
      alert("로그인 후 좋아요가 가능합니다.");
      return;
    }

    try {
      const isCurrentlyLiked = commentLikeStates[commentNo] || false;

      // 해당 댓글 정보 찾기 (포인트 지급용)
      const targetComment = comments.find(
        (comment) => comment.commentNo === commentNo
      );

      // API 호출 - 좋아요 상태에 따라 다른 엔드포인트 호출
      if (isCurrentlyLiked) {
        await axiosInstance.post(`/api/comment/unlike/${commentNo}`);
      } else {
        await axiosInstance.post(`/api/comment/like/${commentNo}`);

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
                commentLike: isCurrentlyLiked // likeCount → commentLike
                  ? (comment.commentLike || 1) - 1
                  : (comment.commentLike || 0) + 1,
                isLikedByCurrentUser: !isCurrentlyLiked, // isLiked → isLikedByCurrentUser
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
    console.log("댓글 좋아요 상태 초기화:", comments);

    const likeStates = {};
    comments.forEach((comment) => {
      console.log(
        `댓글 ${comment.commentNo} 좋아요 상태:`,
        comment.isLikedByCurrentUser
      );
      likeStates[comment.commentNo] = comment.isLikedByCurrentUser || false;
    });

    console.log("최종 좋아요 상태:", likeStates);
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
        {displayedParentComments.length > 0 ? (
          displayedParentComments.map((comment) => (
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
                    {user && user.userNo == comment.user.userNo ? (
                      <>
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
                      </>
                    ) : null}
                    <div
                      className="bd-reply-insert-button"
                      onClick={() => toggleReplyInput(comment.commentNo)}
                    >
                      {showReplyInput[comment.commentNo] ? "취소" : "답글달기"}
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
                      handleEditContentChange(comment.commentNo, e.target.value)
                    }
                    onKeyPress={(e) => handleEditKeyPress(e, comment.commentNo)}
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
                          commentLikeStates[comment.commentNo] ? "liked" : ""
                        }`}
                        onClick={() => handleCommentLike(comment.commentNo)}
                      >
                        <svg
                          className="bd-like-icon"
                          viewBox="0 0 24 24"
                          fill={
                            commentLikeStates[comment.commentNo]
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="bd-like-count">
                          {comment.commentLike || 0}{" "}
                          {/* likeCount → commentLike */}
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
                                          handleProfileClick(reply.user.userNo)
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
                                            handleEditComment(reply.commentNo);
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
                                      value={editContent[reply.commentNo] || ""}
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
                                            commentLikeStates[reply.commentNo]
                                              ? "liked"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleCommentLike(reply.commentNo)
                                          }
                                        >
                                          <svg
                                            className="bd-like-icon"
                                            viewBox="0 0 24 24"
                                            fill={
                                              commentLikeStates[reply.commentNo]
                                                ? "currentColor"
                                                : "none"
                                            }
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                          </svg>
                                          <span className="bd-like-count">
                                            {reply.commentLike || 0}{" "}
                                            {/* likeCount → commentLike */}
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

      {/* 2025년 7월 10일 추가됨 - 더보기 버튼 및 로딩 */}
      {loading && (
        <div
          className="loading-container"
          style={{ textAlign: "center", padding: "20px" }}
        >
          <div
            className="spinner"
            style={{
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #007bff",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p>댓글을 불러오는 중...</p>
        </div>
      )}

      {hasMore && !loading && displayedParentComments.length > 0 && (
        <div
          className="load-more-container"
          style={{ textAlign: "center", margin: "20px 0" }}
        >
          <button
            onClick={loadMoreComments}
            className="load-more-btn"
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {/* 2025-07-10 수정됨 - 부모댓글 기준으로 남은 개수 계산 */}
            더보기 (
            {comments.filter((c) => !c.parentComment).length -
              displayedParentComments.length}
            개 남음)
          </button>
        </div>
      )}

      {!hasMore && displayedParentComments.length > 0 && (
        <div
          className="all-loaded"
          style={{ textAlign: "center", padding: "20px", color: "#666" }}
        >
          모든 댓글을 불러왔습니다.
        </div>
      )}

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
