// src/components/CommentSection.jsx
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import axios from "axios";

const CommentSection = ({boardNo, isOpen, comments, videoId, onClose, onAddComment}) => {
    const [inputComment, setInputComment] = useState({
        boardNo: boardNo,
        commentContent: "",
    });
    const commentListRef = useRef(null);

    useEffect(() => {
        const listEl = commentListRef.current;
        if (listEl) {
            listEl.scrollTop = listEl.scrollHeight;
        }
    }, [comments]);

    const handleAddComment = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/comment`, inputComment)
                .then(res => {
                    onAddComment(res.data); // ✅ 댓글 추가!
                    setInputComment({ boardNo, commentContent: "" }); // 입력창 초기화
                })
                .catch(err => {
                    console.error("댓글 등록 실패", err);
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
                    댓글
                    <span
                            style={{float: "right", cursor: "pointer", padding: "0.5rem"}}
                            className="comment-close-button"
                            onClick={onClose}
                    >
          X
        </span>
                </div>
                <div
                        className="comment-list"
                        ref={commentListRef}
                >
                    {comments.map((c, idx) => (
                            <div
                                    className="comment"
                                    key={idx}
                            >
                                <div className="comment-header">
                                    <img
                                            //서버에서 불러오기
                                            src="/src/assets/img/main/icons/admin.jpg"
                                            alt="profile"
                                            className="comment-profile-img"
                                    />
                                    <div className="comment-info">
                                        <span className="nickname">{c.user.userNickname}</span>
                                        <span className="comment_write_date">
                  {new Date(c.commentCreateDate).toISOString().slice(0, 16)}
                </span>
                                    </div>
                                </div>
                                <p className="comment-content">{c.commentContent}</p>
                                <div className="comment-actions">
                                    <Button
                                            variant="text"
                                            sx={{
                                                color: "white", // 흰색 따봉
                                                minWidth: 0,
                                                padding: "4px",
                                            }}
                                    >
                                        <ThumbUpAltOutlinedIcon />
                                    </Button>
                                    <Button
                                            variant="text"
                                            sx={{
                                                color: "white",
                                                minWidth: 0,
                                                padding: "4px",
                                            }}
                                    >
                                        <ThumbDownAltOutlinedIcon />
                                    </Button>
                                </div>
                            </div>
                    ))}
                </div>
                <div className="comment-input">
                    <input
                            type="text"
                            placeholder="댓글쓰기"
                            className="comment-input-field"
                            value={inputComment.commentContent}
                            onChange={(e) => setInputComment({
                                ...inputComment,
                                commentContent: e.target.value,
                            })}
                            onKeyPress={handleKeyPress}
                    />
                    {/*<button className="comment-submit-button">⮝</button>*/}
                    <Button
                            variant="outlined"
                            onClick={handleAddComment}
                            sx={{
                                minWidth: "40px",
                                height: "20px",
                                padding: 0,
                                color: "#90caf9",
                                borderColor: "#90caf9",
                            }}
                    >
                        <ArrowUpwardIcon fontSize="medium"/>
                    </Button>
                </div>
            </div>
    );
};

export default CommentSection;