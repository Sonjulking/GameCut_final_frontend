// 2025-07-03 생성됨
// 2025-07-17 수정됨 - 신고 기능 추가
// src/components/VideoItem.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import CommentSection from "./CommentSection.jsx";
import { Chip, Avatar, Stack, Box } from "@mui/material";
// 아이콘 파일들을 import 합니다.
import likeIcon from "../../assets/img/main/icons/like_icon.png";
import likedIcon from "../../assets/img/main/icons/liked_icon.png";
import commentIcon from "../../assets/img/main/icons/comment_icon.png";
import shareIcon from "../../assets/img/main/icons/share_icon.png";
import saveIcon from "../../assets/img/main/icons/save_icon.png";
import reportIcon from "../../assets/img/main/icons/report_icon.png";

import videoLoadingImage from "../../assets/img/main/logo/gamecut_logo(black).png";
import axiosInstance from "../../lib/axiosInstance.js";
// 2025-07-17 수정됨 - 신고 모달 컴포넌트 추가
import ReportModal from "../../pages/ReportModal.jsx";
import { useSelector } from "react-redux";

const VideoItem = ({ board, isLoading, onBoardUpdate }) => {
  const {
    boardTitle,
    boardContent,
    user,
    video,
    photos,
    comments: initialComments,
  } = board;

  // 2025-07-17 수정됨 - 로그인 상태 및 신고 관련 상태 추가
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const currentUser = useSelector((state) => state.auth.user);
  const [isReportOpen, setIsReportOpen] = useState(false);

  //video 태그를 직접 조작하기위해  useRef() 사용
  const videoRef = useRef(null);
  const commentRef = useRef(null); // ✅ 댓글창 참조

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comments, setComments] = useState(initialComments || []);
  const [totalCommentCount, setTotalCommentCount] = useState(0); // 전체 댓글 개수
  const [hasMoreComments, setHasMoreComments] = useState(false); // 더 많은 댓글이 있는지 여부
  const [isLoadingComments, setIsLoadingComments] = useState(false); // 댓글 로딩 상태
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false); // 2025-07-17 수정됨 - 좋아요 처리 중 상태 추가

  // 좋아요 여부 체크
  const checkLikeStatus = async () => {
    if (!isLoggedIn) {
      setIsLiked(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/board/isLike/${board.boardNo}`
      );
      setIsLiked(response.data);
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
      setIsLiked(false);
    }
  };

  // 2025년 7월 14일 수정됨 - 좋아요 취소 기능 제거, 단순화
  const handleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 좋아요가 가능합니다.");
      return;
    }

    if (isLiked || isLiking) {
      alert("이미 좋아요를 누르셨습니다.");
      return;
    }

    // 2025-07-17 수정됨 - 좋아요 처리 중 상태 설정 및 즉시 UI 업데이트
    setIsLiking(true);
    setIsLiked(true);

    try {
      await axiosInstance.post(`/api/board/like/${board.boardNo}`);

      // 포인트 지급 (본인 게시글이 아닌 경우에만)
      if (
        board &&
        board.user &&
        currentUser &&
        board.user.userNo !== currentUser.userNo
      ) {
        try {
          const pointData = new FormData();
          pointData.append("point", 5);
          pointData.append("reason", "동영상 좋아요 획득");
          pointData.append("recievedUserNo", board.user.userNo);
          await axiosInstance.post("/api/user/updatePoint", pointData);
        } catch (pointError) {
          console.error("게시글 좋아요 포인트 지급 실패:", pointError);
        }
      }

      // 2025-07-17 수정됨 - 부모 컴포넌트에 좋아요 수 업데이트 알림
      if (onBoardUpdate) {
        onBoardUpdate(board.boardNo, {
          ...board,
          boardLike: (board.boardLike || 0) + 1,
          isLikedByCurrentUser: true,
        });
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
      
      // 2025-07-17 수정됨 - API 실패 시 상태 되돌리기
      setIsLiked(false);
    } finally {
      setIsLiking(false);
    }
  };

  // 초기 댓글 설정 및 전체 댓글 개수 조회
  useEffect(() => {
    const initComments = initialComments || [];
    setComments(initComments);

    if (initComments.length === 5) {
      // 5개 댓글이 있으면 더 많은 댓글이 있을 가능성
      setHasMoreComments(true);
      // 2025-07-14 수정됨 - 삭제된 댓글도 포함한 전체 댓글 개수 조회
      axiosInstance
        .get(`/api/comment/board/${board.boardNo}/count-including-deleted`)
        .then((response) => {
          const total = response.data;
          setTotalCommentCount(total);
          setHasMoreComments(total > 5);
        })
        .catch((error) => {
          console.error("댓글 개수 조회 실패:", error);
          setTotalCommentCount(initComments.length);
          setHasMoreComments(false);
        });
    } else {
      setTotalCommentCount(initComments.length);
      setHasMoreComments(false);
    }
  }, [initialComments, board.boardNo]);

  // 2025-07-17 수정됨 - 컴포넌트 마운트 시 좋아요 상태 체크
  useEffect(() => {
    if (board.boardNo && isLoggedIn) {
      checkLikeStatus();
    }
    // board 객체에서 좋아요 상태가 있다면 사용
    if (board.isLikedByCurrentUser !== undefined) {
      setIsLiked(board.isLikedByCurrentUser);
    }
  }, [board.boardNo, isLoggedIn, board.isLikedByCurrentUser]);

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
          if (entry.isIntersecting) {
            //entry.isIntersecting은 해당 요소가 화면에 지정된 비율만큼 보이면 true가 됨.
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
      { threshold: 0.6 } //60%가 보이면 observer 실행
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
    return () =>
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, []);

  // 댓글 더 불러오기 함수
  const loadMoreComments = useCallback(async () => {
    if (isLoadingComments || !hasMoreComments) return;

    setIsLoadingComments(true);
    try {
      const nextPage = currentPage + 1;
      // 2025-07-14 수정됨 - 삭제된 댓글도 포함한 API 사용
      const response = await axiosInstance.get(
        `/api/comment/board/${board.boardNo}`,
        {
          params: {
            page: nextPage,
            size: 5, // 10에서 5로 변경
          },
        }
      );

      const newComments = response.data;

      if (newComments.length === 0) {
        // 더 이상 댓글이 없음
        setHasMoreComments(false);
      } else {
        // 기존 댓글에 새 댓글 추가 (중복 제거)
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.commentNo));
          const filteredNew = newComments.filter(
            (c) => !existingIds.has(c.commentNo)
          );
          return [...prev, ...filteredNew];
        });
        setCurrentPage(nextPage);

        // 불러온 댓글이 5개 미만이면 더 이상 없음
        if (newComments.length < 5) {
          setHasMoreComments(false);
        }
      }
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [board.boardNo, currentPage, hasMoreComments, isLoadingComments]);

  // 댓글 토글 클릭 핸들러
  const toggleComment = () => {
    setIsCommentOpen((prev) => !prev);

    if (window.innerWidth <= 768) {
      //모바일 기기일경우
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
    setComments((prev) => [newComment, ...prev]); // 새 댓글을 맨 앞에 추가
    setTotalCommentCount((prev) => prev + 1); // 총 개수 증가
  };

  // 2025-07-17 수정됨 - 신고 버튼 클릭 함수 추가
  const handleReport = () => {
    if (!isLoggedIn) {
      alert("로그인 후 신고가 가능합니다.");
      return;
    }
    setIsReportOpen(true);
  };

  // 2025-07-17 수정됨 - 신고 제출 함수 추가
  const handleReportSubmit = async (content) => {
    try {
      const res = await axiosInstance.post("/api/report", {
        boardNo: board.boardNo,
        reportContent: content,
        reportType: "비디오",
      });

      if (res.data.success) {
        alert("신고가 접수되었습니다.");
      } else {
        alert("신고 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("신고 실패", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
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
          style={isLoading ? { pointerEvents: "none" } : {}}
        >
          <source
            src={import.meta.env.VITE_API_URL + video?.attachFile.fileUrl}
            type="video/mp4"
          />
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>
        <div
          className="video_texts"
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <Box
            sx={{
              maxHeight: "100px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src={
                user.photo && user.photo.attachFile
                  ? import.meta.env.VITE_API_URL + user.photo.attachFile.fileUrl
                  : "/common/empty.png"
              }
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
        style={isLoading ? { pointerEvents: "none", opacity: 0.4 } : {}}
      >
        <button
          className={`video_side_buttons ${isLiked ? "liked" : ""}`}
          aria-label="좋아요"
          onClick={handleLike}
          disabled={isLiked || isLiking}
        >
          <img src={isLiked ? likedIcon : likeIcon} alt="좋아요" />
        </button>
        <button
          className="video_side_buttons comment_toggle_button"
          aria-label="댓글"
          aria-expanded={isCommentOpen}
          aria-controls={`comments-for-video-${board.no}`}
          onClick={toggleComment}
        >
          <img src={commentIcon} alt="댓글" />
          {/* 댓글 개수 표시 */}
          {totalCommentCount > 0 && (
            <span className="comment-count">
              {totalCommentCount > 99 ? "99+" : totalCommentCount}
            </span>
          )}
        </button>
        <button className="video_side_buttons" aria-label="공유">
          <img src={shareIcon} alt="공유" />
        </button>
        <button className="video_side_buttons" aria-label="저장">
          <img src={saveIcon} alt="저장" />
        </button>
        <button
          className="video_side_buttons"
          aria-label="신고"
          onClick={handleReport}
        >
          <img src={reportIcon} alt="신고" />
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
        hasMoreComments={hasMoreComments}
        isLoadingComments={isLoadingComments}
        onLoadMore={loadMoreComments}
        totalCount={totalCommentCount}
      />

      {/* 2025-07-17 수정됨 - 신고 모달 추가 */}
      <ReportModal
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default VideoItem;
