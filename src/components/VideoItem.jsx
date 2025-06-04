// src/components/VideoItem.jsx
import React, {useEffect, useRef, useState} from "react";
import CommentSection from "./CommentSection.jsx";

// 아이콘 파일들을 import 합니다.
import likeIcon from "../assets/img/main/icons/like_icon.png";
import commentIcon from "../assets/img/main/icons/comment_icon.png";
import shareIcon from "../assets/img/main/icons/share_icon.png";
import saveIcon from "../assets/img/main/icons/save_icon.png";
import reportIcon from "../assets/img/main/icons/report_icon.png";

const VideoItem = ({videoData}) => {
    //video 태그를 직접 조작하기위해  useRef() 사용
    const videoRef = useRef(null);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [comments, setComments] = useState([...videoData.comments]);

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
                            entry.target.play(); //entry.target : 관찰중인 요소 , play() 재생
                            entry.target.style.opacity = "1"; // 투명도 100%
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
    }, []);

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
                    <button className="video_side_buttons" aria-label="신고">
                        <img src={reportIcon} alt="신고"/>
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