// 2025-07-03 16:15 생성됨
// src/components/CommentSection.jsx
import React, {useEffect, useRef, useState, useCallback} from "react";
import {Button, IconButton, Typography, CircularProgress} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CloseIcon from "@mui/icons-material/Close";
import {formatRelativeTimeKo} from "../../util/timeFormatUtil.js";
import {useSelector} from "react-redux";
import axiosInstance from "../../lib/axiosInstance.js";

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
    totalCount
}) => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    const [inputComment, setInputComment] = useState({
        boardNo: boardNo,
        commentContent: "",
    });
    const [lastCommentCount, setLastCommentCount] = useState(0); // 이전 댓글 개수 추적
    const [isNewCommentAdded, setIsNewCommentAdded] = useState(false); // 새 댓글 작성 여부
    const [likedComments, setLikedComments] = useState(new Set()); // 좋아요한 댓글들
    const [commentLikes, setCommentLikes] = useState({}); // 댓글별 좋아요 수

    // 대댓글 관련 상태 추가
    const [showReplies, setShowReplies] = useState({});
    const [showReplyInput, setShowReplyInput] = useState({});
    const [replyInputs, setReplyInputs] = useState({});

    const commentListRef = useRef(null);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    // 댓글 좋아요 상태 초기화 - detail.jsx 방식과 동일하게 수정
    useEffect(() => {
        if (isLoggedIn && comments.length > 0) {
            const checkLikedComments = async () => {
                const likedSet = new Set();
                const likesCount = {};

                for (const comment of comments) {
                    try {
                        // detail.jsx와 동일한 방식으로 좋아요 상태 확인
                        const response = await axiosInstance.post(`/comment/isLike/${comment.commentNo}`);
                        if (response.data) {
                            likedSet.add(comment.commentNo);
                        }
                        // 좋아요 수 저장
                        likesCount[comment.commentNo] = comment.commentLike || 0;
                    } catch (error) {
                        console.error("댓글 좋아요 상태 확인 실패:", error);
                        likesCount[comment.commentNo] = comment.commentLike || 0;
                    }
                }

                setLikedComments(likedSet);
                setCommentLikes(likesCount);
            };

            checkLikedComments();
        } else {
            // 비로그인 시에도 좋아요 수는 표시
            const likesCount = {};
            comments.forEach(comment => {
                likesCount[comment.commentNo] = comment.commentLike || 0;
            });
            setCommentLikes(likesCount);
        }
    }, [comments, isLoggedIn]);

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

            // detail.jsx와 동일한 방식으로 API 호출
            if (isCurrentlyLiked) {
                // 좋아요 취소
                await axiosInstance.post(`/comment/unlike/${commentNo}`);
                setLikedComments(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(commentNo);
                    return newSet;
                });
                setCommentLikes(prev => ({
                    ...prev,
                    [commentNo]: Math.max(0, (prev[commentNo] || 0) - 1)
                }));
            } else {
                // 좋아요 추가
                await axiosInstance.post(`/comment/like/${commentNo}`);
                setLikedComments(prev => new Set(prev).add(commentNo));
                setCommentLikes(prev => ({
                    ...prev,
                    [commentNo]: (prev[commentNo] || 0) + 1
                }));
            }

            // 서버 상태 재확인을 위한 알림 (선택사항)
            console.log(`댓글 ${commentNo} 좋아요 ${isCurrentlyLiked ? "취소" : "추가"} 완료`);
            
        } catch (error) {
            console.error("댓글 좋아요 처리 실패:", error);
            alert("좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
            
            // 에러 발생 시 상태 재확인
            try {
                const response = await axiosInstance.post(`/comment/isLike/${commentNo}`);
                if (response.data !== likedComments.has(commentNo)) {
                    if (response.data) {
                        setLikedComments(prev => new Set(prev).add(commentNo));
                    } else {
                        setLikedComments(prev => {
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

            const response = await axiosInstance.post(`/comment`, requestData);

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

        axiosInstance.post(`/comment`, inputComment)
                .then(res => {
                    setIsNewCommentAdded(true); // 새 댓글 작성 플래그 설정
                    onAddComment(res.data); // 댓글 추가!
                    setInputComment({boardNo, commentContent: ""}); // 입력창 초기화
                })
                .catch(err => {
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
                    <IconButton onClick={onClose} size="small" sx={{color: "white"}}>
                        <CloseIcon/>
                    </IconButton>
                </div>

                <div
                        className="comment-list"
                        ref={commentListRef}
                >
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
                                                <div
                                                        className="comment"
                                                        key={c.commentNo || idx}
                                                >
                                                    <div className="comment-header">
                                                        <img
                                                                src="/src/assets/img/main/icons/admin.jpg"
                                                                alt="profile"
                                                                className="comment-profile-img"
                                                        />
                                                        <div className="comment-info">
                                                    <span className="nickname">{c.user.userNickname}
                                                        <span className="comment_write_date">
                                                         {formatRelativeTimeKo(c.commentCreateDate)}
                                                        </span>
                                                    </span>
                                                        </div>
                                                    </div>
                                                    <p className="comment-content">{c.commentContent}</p>
                                                    <div className="comment-actions">
                                                        <Button
                                                                variant="text"
                                                                onClick={() => handleCommentLike(c.commentNo)}
                                                                sx={{
                                                                    color: likedComments.has(c.commentNo) ? "#90caf9" : "rgba(255, 255, 255, 0.6)",
                                                                    minWidth: 0,
                                                                    padding: "4px 8px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                    "&:hover": {
                                                                        color: "#90caf9",
                                                                        backgroundColor: "rgba(144, 202, 249, 0.1)",
                                                                    }
                                                                }}
                                                        >
                                                            {likedComments.has(c.commentNo) ?
                                                                    <ThumbUpIcon fontSize="small" /> :
                                                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                                            }
                                                            <span style={{ fontSize: "0.8rem", marginLeft: "2px" }}>
                                                        {commentLikes[c.commentNo] || 0}
                                                    </span>
                                                        </Button>

                                                        {/* 답글달기 버튼 */}
                                                        <Button
                                                                variant="text"
                                                                size="small"
                                                                onClick={() => toggleReplyInput(c.commentNo)}
                                                                sx={{
                                                                    minWidth: "auto",
                                                                    padding: "2px 6px",
                                                                    lineHeight: 1.2,
                                                                }}
                                                        >
                                                            <Typography fontSize="1rem">
                                                                {showReplyInput[c.commentNo] ? "취소" : "답글달기"}
                                                            </Typography>
                                                        </Button>



                                                    </div>

                                                    {/* 대댓글 입력창 */}
                                                    {showReplyInput[c.commentNo] && (
                                                            <div
                                                                    className="reply-input"
                                                                    style={{
                                                                        marginTop: "12px",
                                                                        marginLeft: "8px",
                                                                        display: "flex",
                                                                        gap: "8px",
                                                                        alignItems: "center",
                                                                    }}
                                                            >
                                                                <input
                                                                        type="text"
                                                                        placeholder="대댓글을 입력하세요..."
                                                                        value={replyInputs[c.commentNo] || ""}
                                                                        onChange={(e) => handleReplyInputChange(c.commentNo, e.target.value)}
                                                                        onKeyPress={(e) => handleReplyKeyPress(e, c.commentNo)}
                                                                        style={{
                                                                            flex: 1,
                                                                            padding: "6px 10px", // padding 살짝 줄임
                                                                            borderRadius: "6px", // 네모 느낌 (원형X)
                                                                            border: "1px solid #444",
                                                                            backgroundColor: "#2a2a2a",
                                                                            color: "white",
                                                                            fontSize: "0.85rem",
                                                                        }}
                                                                />
                                                                <Button
                                                                        variant="outlined"
                                                                        onClick={() => handleAddCoComment(c.commentNo)}
                                                                        disabled={!replyInputs[c.commentNo]?.trim()}
                                                                        sx={{
                                                                            minWidth: "40px",
                                                                            height: "32px", //  위아래 크기 키움
                                                                            padding: 0,
                                                                            color: "#90caf9",
                                                                            borderColor: "#90caf9",
                                                                            "& .MuiSvgIcon-root": {
                                                                                fontSize: "1rem", // 아이콘도 살짝 키우기
                                                                            },
                                                                            "&.Mui-disabled": {
                                                                                color: "#666",
                                                                                borderColor: "#666",
                                                                            },
                                                                        }}
                                                                >
                                                                    <ArrowUpwardIcon fontSize="inherit" />
                                                                </Button>
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
                                                                <div style={{marginTop: "12px"}}>
                                                                    <Button
                                                                            variant="text"
                                                                            onClick={() => toggleReplies(c.commentNo)}
                                                                            sx={{
                                                                                color: "#90caf9",
                                                                                fontSize: "0.8rem",
                                                                                minWidth: 0,
                                                                                padding: "4px 8px",
                                                                                textTransform: "none",
                                                                                "&:hover": {
                                                                                    backgroundColor: "rgba(144, 202, 249, 0.1)",
                                                                                }
                                                                            }}
                                                                    >
                                                                        {showReplies[c.commentNo]
                                                                                ? "답글 숨기기"
                                                                                : `답글 ${replyCount}개 보기`}
                                                                    </Button>

                                                                    {showReplies[c.commentNo] && (
                                                                            <div style={{marginLeft: "20px", marginTop: "8px"}}>
                                                                                {comments
                                                                                        .filter(
                                                                                                (reply) =>
                                                                                                        reply.parentComment &&
                                                                                                        reply.parentComment.commentNo === c.commentNo
                                                                                        )
                                                                                        .map((reply, replyIndex) => (
                                                                                                <div
                                                                                                        key={reply.commentNo || replyIndex}
                                                                                                        className="comment reply-comment"
                                                                                                        style={{
                                                                                                            borderLeft: "2px solid #444",
                                                                                                            paddingLeft: "12px",
                                                                                                            marginBottom: "12px"
                                                                                                        }}
                                                                                                >
                                                                                                    <div className="comment-header">
                                                                                                        <img
                                                                                                                src="/src/assets/img/main/icons/admin.jpg"
                                                                                                                alt="profile"
                                                                                                                className="comment-profile-img"
                                                                                                                style={{width: "24px", height: "24px"}}
                                                                                                        />
                                                                                                        <div className="comment-info">
                                                                                    <span className="nickname" style={{fontSize: "0.9rem"}}>
                                                                                        {reply.user.userNickname}
                                                                                        <span className="comment_write_date">
                                                                                            {formatRelativeTimeKo(reply.commentCreateDate)}
                                                                                        </span>
                                                                                    </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <p className="comment-content" style={{fontSize: "0.9rem", marginLeft: "32px"}}>
                                                                                                        {reply.commentContent}
                                                                                                    </p>
                                                                                                    <div className="comment-actions" style={{marginLeft: "32px"}}>
                                                                                                        <Button
                                                                                                                variant="text"
                                                                                                                onClick={() => handleCommentLike(reply.commentNo)}
                                                                                                                sx={{
                                                                                                                    color: likedComments.has(reply.commentNo) ? "#90caf9" : "rgba(255, 255, 255, 0.6)",
                                                                                                                    minWidth: 0,
                                                                                                                    padding: "4px 8px",
                                                                                                                    display: "flex",
                                                                                                                    alignItems: "center",
                                                                                                                    gap: "4px",
                                                                                                                    "&:hover": {
                                                                                                                        color: "#90caf9",
                                                                                                                        backgroundColor: "rgba(144, 202, 249, 0.1)",
                                                                                                                    }
                                                                                                                }}
                                                                                                        >
                                                                                                            {likedComments.has(reply.commentNo) ?
                                                                                                                    <ThumbUpIcon fontSize="small" /> :
                                                                                                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                                                                                            }
                                                                                                            <span style={{ fontSize: "0.8rem", marginLeft: "2px" }}>
                                                                                        {commentLikes[reply.commentNo] || 0}
                                                                                    </span>
                                                                                                        </Button>
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
                                                    minHeight: "60px"
                                                }}
                                        >
                                            {isLoadingComments ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                                                                textDecoration: "underline"
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
                                        <div style={{
                                            textAlign: "center",
                                            padding: "16px",
                                            color: "#666",
                                            fontSize: "0.9rem"
                                        }}>
                                            {comments.length <= 5
                                                    ? "마지막 댓글입니다."
                                                    : "모든 댓글을 확인했습니다."
                                            }
                                        </div>
                                )}
                            </>
                    )}
                </div>

                <div className="comment-input">
                    <input
                            type="text"
                            placeholder={isLoggedIn ? "댓글 작성" : "로그인 후 댓글이 작성가능합니다."}
                            className="comment-input-field"
                            value={inputComment.commentContent}
                            onChange={(e) => setInputComment({
                                ...inputComment,
                                commentContent: e.target.value,
                            })}
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
                        <ArrowUpwardIcon fontSize="medium"/>
                    </Button>
                </div>
            </div>
    );
};

export default CommentSection;