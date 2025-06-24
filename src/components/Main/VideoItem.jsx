// src/components/VideoItem.jsx
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import CommentSection from "./CommentSection.jsx";
import {Chip, Avatar, Stack, Box} from "@mui/material";
// 아이콘 파일들을 import 합니다.
import likeIcon from "../../assets/img/main/icons/like_icon.png";
import commentIcon from "../../assets/img/main/icons/comment_icon.png";
import shareIcon from "../../assets/img/main/icons/share_icon.png";
import saveIcon from "../../assets/img/main/icons/save_icon.png";
import reportIcon from "../../assets/img/main/icons/report_icon.png";

import videoLoadingImage from "../../assets/img/main/logo/gamecut_logo(black).png";

const VideoItem = ({board, isLoading}) => {
    const {
        boardTitle,
        boardContent,
        user,
        video,
        photos,
        comments: initialComments,
    } = board;
    //video 태그를 직접 조작하기위해  useRef() 사용
    const videoRef = useRef(null);
    const commentRef = useRef(null); // ✅ 댓글창 참조


    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [comments, setComments] = useState(initialComments || []);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useLayoutEffect(() => {
        const video = videoRef.current;
        const comment = commentRef.current;
        if (video && comment) {
            const videoHeight = video.clientHeight;
            comment.style.height = `${videoHeight}px`;
        }
    }, [isVideoReady, isCommentOpen]);


    useEffect(() => {
        const handleResize = () => {
            setIsCommentOpen(false); // 화면 크기 바뀌면 댓글창 닫기
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    // IntersectionObserver 생성 후 비디오 요소 관찰
    useEffect(() => {
        //현재 비디오 요소
        const videoEl = videoRef.current;
        //비디오 요소 없으면 종료
        if (!videoEl) return;

        //DOM 요소가 다른 요소(주로 뷰포트)와 교차하는 정도를 비동기적으로 감지하는 API.
        const observer = new IntersectionObserver(
                //entries : 감지된 대상들에 대한 정보가 배열들로 들어옴
                (entries) => {
                    //entries는 관찰중인 DOM 요소들의 상태가 담긴 객체들이고, entry는 그 중 하나.
                    entries.forEach((entry) => {
                        //반복문으로 하나씩 상태를 꺼내서 검사함.
                        if (entry.isIntersecting) { //entry.isIntersecting은 해당 요소가 화면에 지정된 비율만큼 보이면 true가 됨.
                            if (!isLoading) {
                                entry.target.play(); //entry.target : 관찰중인 요소 , play() 재생
                                entry.target.style.opacity = "1"; // 투명도 100%
                            } else {
                                entry.target.pause(); //
                                entry.target.style.opacity = "0.5";
                            }

                        } else {
                            entry.target.pause(); //일시정지
                            entry.target.style.opacity = "0.5"; //투명도 50%
                        }
                    });
                },
                {threshold: 0.6} //60%가 보이면 observer 실행
        );

        //무슨 대상을 관찰할지
        observer.observe(videoEl);
        //메모리를 위해 클린업
        return () => observer.unobserve(videoEl);
    }, [isLoading]);

    // 메타데이터 로드 완료 시 세로/가로 영상 분류하여 클래스 추가
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const onLoadedMetadata = () => {
            if (videoEl.videoWidth <= videoEl.videoHeight) {
                videoEl.classList.add("heightVideo"); //세로영상
            } else {
                videoEl.classList.add("widthVideo"); //가로영상
            }
        };
        //메타데이터 로드시 함수실행
        videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
        //클린업
        return () => videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
    }, []);

    // 댓글 토글 클릭 핸들러
    const toggleComment = () => {
        setIsCommentOpen((prev) => !prev);

        if (window.innerWidth <= 768) { //모바일 기기일경우
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
                            controls={isVideoReady}
                            poster={
                                photos[0]?.attachFile?.fileUrl
                                        ? import.meta.env.VITE_API_URL + photos[0].attachFile.fileUrl
                                        : videoLoadingImage
                            }
                            muted
                            loop
                            playsInline
                            onError={(e) => {
                                // 퍼블릭 폴더에 fallback-video.mp4를 배치했다면 절대 경로로 지정합니다.
                                e.target.src = "/fallback-video.mp4";
                                e.target.alt = "비디오를 로드할 수 없습니다.";
                            }}
                            onCanPlay={() => setIsVideoReady(true)} // 비디오 재생 가능해질 때 controls 보이기
                            style={isLoading ? {pointerEvents: "none"} : {}}
                    >
                        <source
                                src={import.meta.env.VITE_API_URL + video?.attachFile.fileUrl}
                                type="video/mp4"
                        />
                        브라우저가 비디오 태그를 지원하지 않습니다.
                    </video>
                    <div
                            className="video_texts"
                            style={{display: "flex", flexDirection: "column", gap: "6px"}}
                    >
                        <Box
                                sx={{
                                    maxHeight: "100px",
                                    overflowY: "auto",
                                    paddingRight: "4px",
                                }}
                        >
                            <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                            >
                                {video?.tagByVideoList?.map((tagItem, index) => (
                                        <Chip
                                                key={index}
                                                avatar={
                                                    <Avatar
                                                            src={import.meta.env.VITE_API_URL + tagItem.tag.fileUrl}
                                                            alt={tagItem.tag.tagName}
                                                    />
                                                }
                                                label={`#${tagItem.tag.tagName}`}
                                                variant="outlined"
                                                sx={{
                                                    color: "#fff", // 글씨 흰색
                                                    borderColor: "#444", // 테두리 어두운 회색
                                                    backgroundColor: "#222", // 바탕 진한 회색
                                                    "& .MuiChip-avatar": {
                                                        width: 20,
                                                        height: 20,
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: "#333",
                                                    },
                                                    fontSize: "0.85rem",
                                                    fontWeight: 500,
                                                }}
                                        />
                                ))}
                            </Stack>
                        </Box>
                        {/* 유저 정보 (이미지 + 이름 한 줄) */}
                        <div
                                className="video_user_profile"
                                style={{display: "flex", alignItems: "center"}}
                        >
                            <img
                                    src="/src/assets/img/main/icons/admin.jpg"
                                    alt="프로필"
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginRight: "8px",
                                    }}
                            />
                            <span className="video_title">{user.userNickname}</span>
                        </div>

                        {/* 제목 한 줄 */}
                        <div className="video_title">제목 : {boardTitle}</div>

                        {/* 내용 한 줄 */}
                        <div className="video_content">내용 : {boardContent}</div>

                    </div>
                </div>

                <div
                        className="video_side_buttons_wrapper"
                        style={isLoading ? {pointerEvents: "none", opacity: 0.4} : {}}
                >
                    <button
                            className="video_side_buttons"
                            aria-label="좋아요"
                    >
                        <img
                                src={likeIcon}
                                alt="좋아요"
                        />
                    </button>
                    <button
                            className="video_side_buttons comment_toggle_button"
                            aria-label="댓글"
                            aria-expanded={isCommentOpen}
                            aria-controls={`comments-for-video-${board.no}`}
                            onClick={toggleComment}
                    >
                        <img
                                src={commentIcon}
                                alt="댓글"
                        />
                    </button>
                    <button
                            className="video_side_buttons"
                            aria-label="공유"
                    >
                        <img
                                src={shareIcon}
                                alt="공유"
                        />
                    </button>
                    <button
                            className="video_side_buttons"
                            aria-label="저장"
                    >
                        <img
                                src={saveIcon}
                                alt="저장"
                        />
                    </button>
                    <button
                            className="video_side_buttons"
                            aria-label="신고"
                    >
                        <img
                                src={reportIcon}
                                alt="신고"
                        />
                    </button>
                </div>

                <CommentSection
                        ref={commentRef}
                        boardNo={board.boardNo}
                        isOpen={isCommentOpen}
                        comments={comments}
                        videoId={video?.videoNo}
                        onClose={toggleComment}
                        onAddComment={addComment}
                />
            </div>
    );
};

export default VideoItem;