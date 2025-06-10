// src/components/CommentSection.jsx
import React, {useEffect, useRef, useState} from "react";

const CommentSection = ({isOpen, comments, videoId, onClose, onAddComment}) => {
    const [inputText, setInputText] = useState("");
    const commentListRef = useRef(null);

    // 댓글이 추가될 때마다 스크롤을 맨 아래로
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

    const handleKeyPress = e => {
        if (e.key === "Enter") {
            handleAddComment();
        }
    };

    return (
            <div
                    id={`comments-for-video-${videoId}`}
                    className="main_comment_wrapper"
                    style={{display: isOpen ? "block" : "none"}}
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
                                <span className="nickname">{c.user.userNickname}</span>: {c.commentContent}
                                <span className="comment_write_date">  {new Date(c.commentCreateDate).toISOString().slice(0, 10)}</span>
                            </div>
                    ))}
                </div>
                <div className="comment-input">
                    <input
                            type="text"
                            placeholder="댓글쓰기"
                            className="comment-input-field"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                    />
                    <button className="comment-submit-button" onClick={handleAddComment}>
                        ↑
                    </button>
                </div>
            </div>
    );
};

export default CommentSection;
