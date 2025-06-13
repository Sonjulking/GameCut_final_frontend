// src/components/VideoList.jsx
import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";
import LoadingScreen from "../Loading/LoadingScreen.jsx";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const observer = useRef(null);

    // useCallback은 React의 Hook 중 하나로, 함수의 불필요한 재생성을 방지해서 성능 최적화를 도와주는 도구
    const fetchNextBoard = useCallback(async () => {
        if (isLoading || isEnd) return;
        setIsLoading(true);
        try {
            // 1.5초(1500ms) 지연 시간
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await axios.get(import.meta.env.VITE_API_URL + "/board/one");
            const data = res.data;

            if (!data || data.length === 0) {
                setIsEnd(true);
                return;
            }

            setBoardList(prev => {
                const updated = [...prev, ...data];
                return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isEnd]);


    useEffect(() => {
        fetchNextBoard();
    }, []);

    const lastItemRef = useCallback(
            node => {
                if (isLoading) return;
                if (observer.current) observer.current.disconnect();
                observer.current = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting) {
                        fetchNextBoard();
                    }
                });
                if (node) observer.current.observe(node);
            },
            [fetchNextBoard, isLoading]
    );

    return (
            <div className="video_wrap">
                {/* 로딩창은 위에 오버레이로 덮음 */}
                {/*로딩 넣으면 자꾸 오류나서 일단 제거했습니다.*/}
                {/*
                {isLoading && (
                        <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                        >
                            <LoadingScreen/>
                        </div>
                )}*/}
                {boardList.map((board, idx) => (
                        <div
                                key={board.boardNo}
                                ref={idx === boardList.length - 1 ? lastItemRef : null}
                        >
                            <VideoItem board={board} isLoading={isLoading}/>
                        </div>
                ))}


                {isEnd && <p style={{textAlign: "center", color: "#888"}}>마지막 게시글입니다.</p>}
            </div>
    );
};

export default VideoList;
