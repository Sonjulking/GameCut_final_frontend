// src/components/VideoList.jsx
import React, {useState} from "react";
import VideoItem from "./VideoItem";

const VideoList = () => {
    // 컴포넌트 내부에서 dummyVideos 상태 선언
    const [dummyVideos] = useState([
        {
            id: 1,
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            title: "에임 연습 영상",
            content: "발로란트 에임 트래킹 훈련",
            author: "개발자1",
            comments: ["좋아요!", "대박"],
        },
        {
            id: 2,
            url: "https://www.w3schools.com/html/movie.mp4",
            title: "하이라이트",
            content: "적 5명 에이스 영상",
            author: "고수유저",
            comments: ["굿굿", "최고입니다"],
        },
        {
            id: 3,
            url: import.meta.env.BASE_URL + "videos/short_sample baseball.mp4",
            title: "세로 하이라이트",
            content: "모바일 전용 영상 테스트sadasdas",
            author: "모바일유저",
            comments: ["이거 진짜 모바일용이네요!", "UI 짱"],
        },
        {
            id: 4,
            url: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
            title: "새로운 비디오 1",
            content: "추가된 영상 내용",
            author: "새로운유저1",
            comments: [
                "새로운 댓글 1",
                "신기하다",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
            ],
        },
        {
            id: 5,
            url: "https://www.appsloveworld.com/wp-content/uploads/2018/09/sample-mp4-file.mp4",
            title: "새로운 비디오 2",
            content: "또 다른 추가 영상",
            author: "새로운유저2",
            comments: ["이것도 좋네요!", "계속 보고 싶다"],
        },
    ]);

    return (
            <div className="video_wrap">
                {dummyVideos.map((videoData) => (
                        <VideoItem key={videoData.id} videoData={videoData}/>
                ))}
            </div>
    );
};

export default VideoList;
