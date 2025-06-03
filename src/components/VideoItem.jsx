// src/components/VideoItem.jsx
import React, {useEffect, useRef, useState} from "react";
import CommentSection from "./CommentSection.jsx";

// 아이콘 파일들을 import 합니다.
import likeIcon from "../assets/img/main/icons/like_icon.png";
import commentIcon from "../assets/img/main/icons/comment_icon.png";
import shareIcon from "../assets/img/main/icons/share_icon.png";
import saveIcon from "../assets/img/main/icons/save_icon.png";

const VideoItem = ({videoData}) => {
    const videoRef = useRef(null);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [comments, setComments] = useState([...videoData.comments]);

    // IntersectionObserver 생성 후 비디오 요소 관찰
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.play();
                            entry.target.style.opacity = "1";
                        } else {
                            entry.target.pause();
                            entry.target.style.opacity = "0.5";
                        }
                    });
                },
                {threshold: 0.6}
        );

        observer.observe(videoEl);
        return () => observer.unobserve(videoEl);
    }, []);

    // 메타데이터 로드 완료 시 세로/가로 영상 분류하여 클래스 추가
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const onLoadedMetadata = () => {
            if (videoEl.videoWidth <= videoEl.videoHeight) {
                videoEl.classList.add("heightVideo");
            } else {
                videoEl.classList.add("widthVideo");
            }
        };
        videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
        return () => videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
    }, []);

    // 댓글 토글 클릭 핸들러
    const toggleComment = () => {
        setIsCommentOpen((prev) => !prev);
        if (window.innerWidth <= 768) {
            // 모바일에서 댓글창 열릴 때 비디오 일시정지, 닫힐 때 다시 재생
            const videoEl = videoRef.current;
            if (isCommentOpen) {
                videoEl.play();
            } else {
                videoEl.pause();
            }
        }
    };

    // 댓글 추가 함수 (CommentSection 컴포넌트에서 호출)
    const addComment = (newComment) => {
        setComments((prev) => [...prev, newComment]);
    };

    return (
            <div className={`video_container ${isCommentOpen ? "comment-open" : ""}`}>
                <div className="video_wrapper">
                    <video
                            ref={videoRef}
                            className="video_player"
                            controls
                            muted
                            loop
                            playsInline
                            onError={(e) => {
                                // 퍼블릭 폴더에 fallback-video.mp4를 배치했다면 절대 경로로 지정합니다.
                                e.target.src = "/fallback-video.mp4";
                                e.target.alt = "비디오를 로드할 수 없습니다.";
                            }}
                    >
                        <source src={videoData.url} type="video/mp4"/>
                        브라우저가 비디오 태그를 지원하지 않습니다.
                    </video>
                    <div className="video_texts">
                        <div className="video_title">{videoData.author}</div>
                        <div className="video_title">제목 : {videoData.title}</div>
                        <div className="video_content">내용 : {videoData.content}</div>
                    </div>
                </div>

                <div className="video_side_buttons_wrapper">
                    <button className="video_side_buttons" aria-label="좋아요">
                        <img src={likeIcon} alt="좋아요"/>
                    </button>
                    <button
                            className="video_side_buttons comment_toggle_button"
                            aria-label="댓글"
                            aria-expanded={isCommentOpen}
                            aria-controls={`comments-for-video-${videoData.id}`}
                            onClick={toggleComment}
                    >
                        <img src={commentIcon} alt="댓글"/>
                    </button>
                    <button className="video_side_buttons" aria-label="공유">
                        <img src={shareIcon} alt="공유"/>
                    </button>
                    <button className="video_side_buttons" aria-label="저장">
                        <img src={saveIcon} alt="저장"/>
                    </button>
                </div>

                <CommentSection
                        isOpen={isCommentOpen}
                        comments={comments}
                        videoId={videoData.id}
                        onClose={toggleComment}
                        onAddComment={addComment}
                />
            </div>
    );
};

export default VideoItem;
