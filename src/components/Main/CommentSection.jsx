// src/components/CommentSection.jsx
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const CommentSection = ({isOpen, comments, videoId, onClose, onAddComment}) => {
    const [inputText, setInputText] = useState("");
    const commentListRef = useRef(null);

    useEffect(() => {
        const listEl = commentListRef.current;
        if (listEl) {
            listEl.scrollTop = listEl.scrollHeight;
        }
    }, [comments]);

    const handleAddComment = () => {
        const trimmed = inputText.trim();
        if (trimmed) {
            onAddComment(trimmed);
            setInputText("");
        }
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
                <div className="comment-list" ref={commentListRef}>
                    {comments.map((c, idx) => (
                            <div className="comment" key={idx}>
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
                                    <button className="like-button">👍</button>
                                    <button className="dislike-button">👎</button>
                                </div>
                            </div>
                    ))}
                </div>
                <div className="comment-input">
                    <input
                            type="text"
                            placeholder="댓글쓰기"
                            className="comment-input-field"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
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
                        <ArrowUpwardIcon fontSize="medium" />
                    </Button>
                </div>
            </div>
    );
};

export default CommentSection;