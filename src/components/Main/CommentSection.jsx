// src/components/CommentSection.jsx
import React, {useEffect, useRef, useState} from "react";
import {Button, IconButton} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import axios from "axios";
import Cookies from "js-cookie";
import CloseIcon from "@mui/icons-material/Close";
import {formatRelativeTimeKo} from "../../util/timeFormatUtil.js";

const CommentSection = ({boardNo, isOpen, comments, videoId, onClose, onAddComment}) => {
    const token = Cookies.get("accessToken");

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

        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };
        axios.post(`${import.meta.env.VITE_API_URL}/comment`, inputComment, axiosConfig)
                .then(res => {
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
                    댓글
                    <IconButton onClick={onClose} size="small" sx={{color: "white"}}>
                        <CloseIcon/>
                    </IconButton>
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
                                            sx={{
                                                color: "white", // 흰색 따봉
                                                minWidth: 0,
                                                padding: "4px",
                                            }}
                                    >
                                        <ThumbUpAltOutlinedIcon/>
                                    </Button>
                                    <Button
                                            variant="text"
                                            sx={{
                                                color: "white",
                                                minWidth: 0,
                                                padding: "4px",
                                            }}
                                    >
                                        <ThumbDownAltOutlinedIcon/>
                                    </Button>
                                </div>
                            </div>
                    ))}
                </div>
                <div className="comment-input">
                    <input
                            type="text"
                            placeholder={token ? "댓글 작성" : "로그인 후 댓글이 작성가능합니다."}
                            className="comment-input-field"
                            value={inputComment.commentContent}
                            onChange={(e) => setInputComment({
                                ...inputComment,
                                commentContent: e.target.value,
                            })}
                            onKeyPress={handleKeyPress}
                            disabled={!token}
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