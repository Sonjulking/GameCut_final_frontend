// src/components/VideoList.jsx
import React, {useEffect, useState, useRef, useCallback} from "react";
import VideoItem from "./VideoItem.jsx";
import axios from "axios";
import LoadingScreen from "../Loading/LoadingScreen.jsx";

const VideoList = () => {
    const [boardList, setBoardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //마지막 게시글인지
    const [isEnd, setIsEnd] = useState(false);

    // IntersectionObserver를 저장할 ref (재사용을 위해 메모리에 보관)
    const observer = useRef(null);


    //봤던 영상 제외하려는 state
    const [excludeBoardNos, setExcludeBoardNos] = useState([]);

    //게시글을 서버에서 가져오는 함수
    //useCallback을 사용해서 fetchNextBoard 함수가 매번 새로 생성되지 않도록 함
    //useCallback은 의존성 값이 바뀔 때만 함수를 새로 생성하여, 동일 함수 참조를 유지하게 해주는 Hook
    const fetchNextBoard = useCallback(async () => {
        //로딩중이거나 끝났으면 요청 x
        if (isLoading || isEnd) return;
        //로딩시작
        setIsLoading(true);
        try {
            // 1.5초 지연 시간
            await new Promise(resolve => setTimeout(resolve, 1500));

            //서버에다가 post요청
            const res = await axios.post(import.meta.env.VITE_API_URL + "/board/one", excludeBoardNos);
            const data = res.data;

            //받아온 데이터가 없으면 마지막 게시글이라고 표시
            if (!data || data.length === 0) {
                setIsEnd(true);
                return;
            }

            setBoardList(prev => {
                // 기존 리스트(prev)와 새로 불러온 데이터(data)를 합침
                const updated = [...prev, ...data];

                // 만약 리스트 길이가 10개를 초과하면
                if (updated.length > 10) {
                    // 뒤에서부터 10개만 잘라서 리턴 (최신 10개 유지)
                    return updated.slice(updated.length - 10);
                } else {
                    // 10개 이하이면 그대로 리턴
                    return updated;
                }
            });
            setExcludeBoardNos(prev => [...prev, ...data.map(item => item.boardNo)]);
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isEnd]);


    useEffect(() => {
        fetchNextBoard();
    }, []);

    //마지막 게시글 요소에 ref로 연결되는 콜백함수
    //이 ref가 화면에 보이면(next), fetchNextBoard를 실행홰서 다음 게시글을 불러옴
    const lastItemRef = useCallback(
            node => {

                //로딩중이면 observer 연결 안함
                if (isLoading) {
                    return;
                }

                // 기존 observer가 있으면 연결 해제
                if (observer.current) {
                    observer.current.disconnect();
                }

                //IntersectionObserver : 어떤 DOM 요소가 스크롤로 인해 화면아에들오는 순간을 감지해주는 도구
                observer.current = new IntersectionObserver(entries => {
                    //관찰 대상 요소가 화면에 보이면
                    if (entries[0].isIntersecting) {
                        //다음거 불러줌
                        fetchNextBoard();
                    }
                });
                //실제 DOM 요소가 존재하면 관찰 시작
                if (node) {
                    observer.current.observe(node);
                }
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
                                //마지막 요소라면 ref장착
                                ref={idx === boardList.length - 1 ? lastItemRef : null}
                        >
                            <VideoItem
                                    board={board}
                                    isLoading={isLoading}
                            />
                        </div>
                ))}


                {isEnd && <p
                        style={{
                            fontSize: "15pt",
                            textAlign: "center",
                            color: "#888",
                            paddingBottom: "10rem"
                        }}
                >마지막 영상입니다.</p>}
            </div>
    );
};

export default VideoList;
