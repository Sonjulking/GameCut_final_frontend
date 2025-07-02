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
    const isFirstLoadRef = useRef(true); // 첫 로딩인지 추적

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

            // 첫 번째 호출이거나 명시적으로 isFirst가 true인 경우만 빈 배열 사용
            const excludeList = (isFirst && isFirstLoadRef.current) ? [] : excludeBoardRef.current;
            
            // 첫 로딩 완료 표시
            if (isFirst) {
                isFirstLoadRef.current = false;
            }

            const res = await axios.post(import.meta.env.VITE_API_URL + "/board/one", excludeList);
            const data = res.data;
            
            // 데이터가 없으면 더 이상 불러올 영상이 없다는 뜻 isEnd 처리
            if (!data || data.length === 0) {
                setIsEnd(true);
                return false;
            }

            // 새로 받아온 게시글의 boardNo 배열 추출
            const newBoardNos = data.map(item => item.boardNo);

            // 기존 boardList에서 중복 체크 (추가 안전장치)
            const currentBoardNos = new Set([...excludeBoardRef.current]);
            const filteredData = data.filter(item => !currentBoardNos.has(item.boardNo));
            
            if (filteredData.length === 0) {
                // 모든 데이터가 중복이면 다시 시도
                return await fetchNextBoard(false);
            }

            const filteredBoardNos = filteredData.map(item => item.boardNo);

            //  exclude 리스트를 useRef로 즉시 반영
            excludeBoardRef.current = [...excludeBoardRef.current, ...filteredBoardNos];
            setExcludeBoardNos([...excludeBoardRef.current]); // 상태도 업데이트(UI용)

            setBoardList(prev => {
                const updated = [...prev, ...filteredData];
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
                                key={`${board.boardNo}-${idx}`} // 더 안전한 키 생성
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
