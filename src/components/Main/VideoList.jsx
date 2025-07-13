import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";
import LoadingScreen from "../Loading/LoadingScreen.jsx";
import axiosInstance from "../../lib/axiosInstance.js";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [excludeBoardNos, setExcludeBoardNos] = useState([]); //로딩된거는 다시 안뜨게 중복방지용
    const [hasMountedOnce, setHasMountedOnce] = useState(false); // 최초 fetch 완료 여부

    const observer = useRef(null); //무한스크롤 감지기
    const excludeBoardRef = useRef([]); // 중복방지용
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

            const res = await axiosInstance.post("/api/board/one", excludeList);
            const data = res.data;
            
            // 데이터가 없으면 더 이상 불러올 영상이 없다는 뜻 isEnd 처리
            if (!data || data.length === 0) {
                setIsEnd(true);
                return false;
            }


            // 기존 boardList에서 중복 체크 (추가 안전장치)

            //기존에 로드된 게시글 번호들을 Set으로 반환
            const currentBoardNos = new Set([...excludeBoardRef.current]);
            //새로받아온 데이터에서 중복된 것들 필터링
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
                // node는 마지막 VideoItem의 DOM 요소
                if (isLoading || !hasMountedOnce) return;

                if (observer.current) {
                    observer.current.disconnect();
                }

                //IntersectionObserver : 여소가 화면 (뷰포트)에 들어오는지 감지하는 API
                //스크롤 이벤트보다 성능이 훨씬 좋음
                //브라우저가 최적화해서 처리

                observer.current = new IntersectionObserver(entries => {
                    //entries  : 감시중인 요소들의 정보 배열
                    if (entries[0].isIntersecting) { //첫번째 (유일한) 요소) 가 화면에 보이나요
                        fetchNextBoard(); //새영상 업로드
                    }
                });

                if (node) {
                    //브라우저야, 이 DOM 요소가 화면에 보이는지 계속 감시해줘!
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
