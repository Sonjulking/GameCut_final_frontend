import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";
import LoadingScreen from "../Loading/LoadingScreen.jsx";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [excludeBoardNos, setExcludeBoardNos] = useState([]);
    const [hasMountedOnce, setHasMountedOnce] = useState(false); //  최초 fetch 완료 여부

    const observer = useRef(null);

    const fetchNextBoard = useCallback(async (isFirst = false) => {
        if (isLoading || isEnd) return;
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const excludeList = isFirst ? [] : excludeBoardNos;
            const res = await axios.post(import.meta.env.VITE_API_URL + "/board/one", excludeList);
            const data = res.data;

            if (!data || data.length === 0) {
                setIsEnd(true);
                return;
            }

            const newBoardNos = data.map(item => item.boardNo);

            setExcludeBoardNos(prev => [...prev, ...newBoardNos]);

            setBoardList(prev => {
                const updated = [...prev, ...data];
                return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });

        } catch (err) {
            console.error("게시글 로딩 실패:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isEnd, excludeBoardNos]);

    //최초 한 번만 fetch하고 완료되면 observer 허용
    useEffect(() => {
        fetchNextBoard(true).then(() => setHasMountedOnce(true));
    }, []);

    const lastItemRef = useCallback(
            node => {
                if (isLoading || !hasMountedOnce) return; // 최초 로딩 끝나기 전까지 observer 차단

                if (observer.current) {
                    observer.current.disconnect();
                }

                observer.current = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting) {
                        fetchNextBoard();
                    }
                });

                if (node) {
                    observer.current.observe(node);
                }
            },
            [fetchNextBoard, isLoading, hasMountedOnce]
    );

    return (
            <div className="video_wrap">
                {/* 로딩 오버레이 (필요 시 활성화) */}
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
                    <LoadingScreen />
                </div>
            )}
            */}

                {boardList.map((board, idx) => (
                        <div
                                key={board.boardNo}
                                ref={idx === boardList.length - 1 ? lastItemRef : null}
                        >
                            <VideoItem board={board} isLoading={isLoading}/>
                        </div>
                ))}

                {isEnd && (
                        <p
                                style={{
                                    fontSize: "15pt",
                                    textAlign: "center",
                                    color: "#888",
                                    paddingBottom: "10rem"
                                }}
                        >
                            마지막 영상입니다.
                        </p>
                )}
            </div>
    );
};

export default VideoList;
