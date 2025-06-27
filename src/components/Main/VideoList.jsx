import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";
import LoadingScreen from "../Loading/LoadingScreen.jsx";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [excludeBoardNos, setExcludeBoardNos] = useState([]); //로딩된거는 다시 안뜨게 중복방지용
    const [hasMountedOnce, setHasMountedOnce] = useState(false); // 최초 fetch 완료 여부

    const observer = useRef(null);
    const excludeBoardRef = useRef([]); // 실제 exclude 추적용 (즉시 반영됨)

    // 게시글을 가져오는 함수
    //useCallback  : 불필요한 함수가 다시 생성되는 걸 막아줌
    const fetchNextBoard = useCallback(async (isFirst = false) => {
        //이미 로딩중이거나 끝까지 불러왔으면 바로종료
        if (isLoading || isEnd) return false;

        //로딩상태 true로 설정
        setIsLoading(true);
        try {
            //UX 연출용 1.5초 딜레이(실제로는 필요없으면 제거가능)
            await new Promise(resolve => setTimeout(resolve, 1500));

            //최초호출이면 제외리스트를 비우고, 이후에 현재 ref 값 사용
            const excludeList = isFirst ? [] : excludeBoardRef.current;

            const res = await axios.post(import.meta.env.VITE_API_URL + "/board/one", excludeList);
            const data = res.data;
            // 데이터가 없으면 더 이상 불러올 영상이 없다는 뜻 isEnd 처리
            if (!data || data.length === 0) {
                setIsEnd(true);
                return false;
            }

            //새로 받아온 게시글의 boardNo 배열 추출
            const newBoardNos = data.map(item => item.boardNo);

            //  exclude 리스트를 useRef로 즉시 반영
            excludeBoardRef.current = [...excludeBoardRef.current, ...newBoardNos];
            setExcludeBoardNos([...excludeBoardRef.current]); // 상태도 업데이트(UI용)

            setBoardList(prev => {
                const updated = [...prev, ...data];
                return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });

            return true;
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isEnd]);

    // 최초 fetch 한 번만 실행하고 완료되면 observer 연결 허용
    useEffect(() => {
        const fetchFirst = async () => {
            const success = await fetchNextBoard(true);
            if (success) setHasMountedOnce(true);
        };
        fetchFirst();
    }, []);

    // 마지막 요소에 ref 연결
    const lastItemRef = useCallback(
            node => {
                if (isLoading || !hasMountedOnce) return;

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
                {/* 로딩 오버레이 (필요 시) */}
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
