// src/components/VideoList.jsx
import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const observer = useRef(null);

    const fetchNextBoard = useCallback(async () => {
        if (isLoading || isEnd) return;
        setIsLoading(true);
        try {
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
                {boardList.map((board, idx) => (
                        <div
                                key={board.boardNo}
                                ref={idx === boardList.length - 1 ? lastItemRef : null}
                        >
                            <VideoItem board={board}/>
                        </div>
                ))}

                {isLoading && <p style={{textAlign: "center", color: "#aaa"}}>불러오는 중...</p>}
                {isEnd && <p style={{textAlign: "center", color: "#888"}}>마지막 게시글입니다.</p>}
            </div>
    );
};

export default VideoList;
