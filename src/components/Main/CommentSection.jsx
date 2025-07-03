// 2025-07-03 생성됨
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
    const commentListRef = useRef(null);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    // 댓글 좋아요 상태 초기화
    useEffect(() => {
        if (isLoggedIn && comments.length > 0) {
            const checkLikedComments = async () => {
                const likedSet = new Set();
                const likesCount = {};

                for (const comment of comments) {
                    try {
                        // 좋아요 상태 확인
                        const response = await axiosInstance.get(`/comment/like/${comment.commentNo}`);
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

    // 댓글 좋아요 토글
    const handleCommentLike = async (commentNo) => {
        if (!isLoggedIn) {
            alert("로그인 후 좋아요를 누를 수 있습니다.");
            return;
        }

        try {
            const isCurrentlyLiked = likedComments.has(commentNo);

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
        } catch (error) {
            console.error("댓글 좋아요 처리 실패:", error);
            alert("좋아요 처리에 실패했습니다.");
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
                                {/* 댓글 목록 */}
                                {comments.map((c, idx) => (
                                        <div
                                                className="comment"
                                                key={c.commentNo || idx}
                                        >
                                            <div className="comment-header">
                                                <img
                                                        //서버에서 불러오기
                                                        src="/src/assets/img/main/icons/admin.jpg"
                                                        alt="profile"
                                                        className="comment-profile-img"
                                                />
                                                <div className="comment-info">
                                            <span className="nickname">{c.user.userNickname}
                                                <span
                                                        className="comment_write_date"
                                                >
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
                                            </div>
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