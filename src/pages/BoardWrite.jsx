// /components/BoardWrite/BoardWrite.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import FormInputGroup from "../components/BoardWrite/FormInputGroup.jsx";
import VideoUploader from "../components/BoardWrite/VideoUploader";
import PhotoUploader from "../components/BoardWrite/PhotoUploader";
import axiosInstance from "../lib/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const BoardWrite = ({ isEdit = false }) => {
  const navigate = useNavigate(); // 추가
  const { boardNo } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [existingVideo, setExistingVideo] = useState({});
  const [existingPhoto, setExistingPhoto] = useState({});
  const [existingVideoNo, setExistingVideoNo] = useState({});
  const [existingTags, setExistingTags] = useState([]);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isEdit && boardNo) {
      axiosInstance
        .get(`/api/board/${boardNo}`)
        .then((res) => {
          const data = res.data;

          const tagList =
            data.video?.tagByVideoList?.map(
              (tagByVideo) => tagByVideo.tag?.tagName
            ) || [];
          console.log(tagList);
          setForm({
            boardTitle: data.boardTitle,
            boardContent: data.boardContent,
            boardTypeNo: data.boardTypeNo,
            userNo: data.user.userNo,
            videoTags: tagList,
          });
          setExistingVideo(data.video.attachFile);
          setExistingPhoto(data.photos[0]?.attachFile);
          setExistingVideoNo(data.video.videoNo);
          setExistingTags(tagList);
        })
        .catch((err) => console.error("수정용 데이터 로드 실패", err))
        .finally(() => setIsLoading(false));
    }
  }, [isEdit, boardNo]);

  const [form, setForm] = useState({
    boardTitle: "",
    boardContent: "",
    boardTypeNo: 1,
    userNo: 1,
    videoTags: [],
  });
  //비디오 파일
  const [videoFile, setVideoFile] = useState(null);
  //자동 섬네일
  const [autoThumbnailFile, setAutoThumbnailFile] = useState(null);
  //사용자 지정 섬네일
  const [customThumbnailFile, setCustomThumbnailFile] = useState(null);
  //섬네일  모드
  const [thumbnailMode, setThumbnailMode] = useState("auto");
  //사진 파일
  const [photoFiles, setPhotoFiles] = useState([]);
  //로딩
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log("🔄 handleChange 호출:", { name, value }); // 디버깅 로그 추가

    if (name === "videoTags" && Array.isArray(value)) {
      setForm((prev) => ({ ...prev, videoTags: value })); // 배열 그대로
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2025-07-17 수정됨 - 새 게시글 작성 시 포인트 확인
    if (!isEdit) {
      try {
        if (user.userPoint < 100) {
          alert("포인트가 부족합니다. 게시글 작성에는 100포인트가 필요합니다.");
          return; // 게시글 작성 중단
        }
      } catch (error) {
        alert("포인트 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }
    }

    // 디버깅: 전송되는 데이터 확인
    console.log("🔍 전송할 폼 데이터:", form);
    console.log("🔍 boardContent:", form.boardContent);
    console.log("🔍 boardContent 타입:", typeof form.boardContent);
    console.log("🔍 boardContent 길이:", form.boardContent?.length);

    // boardContent 검증 및 기본값 설정
    let contentToSend = form.boardContent;

    // 빈 값이거나 Toast UI Editor의 기본 빈 값인 경우 처리
    if (
      !contentToSend ||
      contentToSend.trim() === "" ||
      contentToSend.trim() === "<p><br></p>" ||
      contentToSend.trim() === "<p></p>"
    ) {
      if (form.boardTypeNo === 3) {
        // 영상 게시판은 간단한 텍스트만 허용
        contentToSend = form.boardContent || "내용 없음";
      } else {
        // 일반 게시판은 HTML 기본값
        contentToSend = "<p>내용 없음</p>";
      }

      console.log("⚠️ 빈 content 감지, 기본값으로 설정:", contentToSend);
    }

    const formData = new FormData();
    formData.append("boardTitle", form.boardTitle);
    formData.append("boardContent", contentToSend); // 검증된 content 사용
    formData.append("boardTypeNo", form.boardTypeNo);
    formData.append("userNo", form.userNo);

    //영상 게시판일때
    if (form.boardTypeNo === 3) {
      if (videoFile) {
        formData.append("file", videoFile);
      }
      formData.append("existingVideoNo", existingVideoNo);

      //썸네일 처리
      if (thumbnailMode === "auto" && autoThumbnailFile) {
        formData.append("thumbnail", autoThumbnailFile);
      } else if (thumbnailMode === "custom" && customThumbnailFile) {
        formData.append("thumbnail", customThumbnailFile);
      }
      form.videoTags.forEach((tag) => formData.append("videoTags", tag));
    } else {
      //사진 처리
      photoFiles.forEach((file) => formData.append("file", file));
    }

    try {
      // 임시 디버깅: 기존 방식도 시도해보기
      const localStorage_token = localStorage.getItem("token");
      console.log("localStorage 토큰:", localStorage_token);

      if (isEdit) {
        await axiosInstance.put(`/api/board/${boardNo}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            // 임시로 기존 방식도 추가
            ...(localStorage_token && {
              Authorization: `Bearer ${localStorage_token}`,
            }),
          },
          //업로드 진행률을 추적하는 콜백함수
          onUploadProgress: (e) => {
            //퍼센트로 변환
            const percent = Math.round((e.loaded * 100) / e.total);
            //계산된 퍼센트를 state에 저장
            setUploadProgress(percent);
          },
        });
        alert("게시글이 수정되었습니다.");
      } else {
        await axiosInstance.post(`/api/board`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            // 임시로 기존 방식도 추가
            ...(localStorage_token && {
              Authorization: `Bearer ${localStorage_token}`,
            }),
          },
          //업로드 진행률을 추적하는 콜백함수
          onUploadProgress: (e) => {
            //퍼센트로 변환
            const percent = Math.round((e.loaded * 100) / e.total);
            //계산된 퍼센트를 state에 저장
            setUploadProgress(percent);
          },
        });

        // 2025-07-17 수정됨 - 게시글 작성 시 포인트 차감 로직 (포인트 확인 후 실행)
        try {
          const pointData = new FormData();
          pointData.append("point", -100);
          pointData.append("reason", "게시글 작성");
          // recievedUserNo는 넣지 않음 → 로그인한 사용자에게 적용

          await axiosInstance.post("/api/user/updatePoint", pointData);
          console.log("게시글 작성 포인트 차감 완료: -100");
        } catch (pointError) {
          console.error("게시글 작성 포인트 차감 실패:", pointError);
          // 포인트 차감 실패해도 게시글 작성은 정상 완료
        }

        alert("게시글이 등록되었습니다.");
      }
      navigate("/board/list");
    } catch (err) {
      console.error(err);
      if (isEdit) {
        alert("게시글이 수정실패했습니다.");
      } else {
        alert("게시글이 등록실패했습니다.");
      }
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 5,
        pb: 10,
        "@media (max-width: 768px)": {
          pb: 15, // 모바일에서 하단 패딩 크게 늘려서 버튼이 잘리지 않게
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          bgcolor: "#1a1a1a",
          p: 4,
          borderRadius: 3,
          border: "1px solid #555",
          "@media (max-width: 768px)": {
            p: 3, // 모바일에서 패딩 조정
            mb: 5, // 모바일에서 하단 마진 크게 늘림
          },
        }}
      >
        <Typography variant="h4" gutterBottom color="white" fontWeight="bold">
          {!isEdit ? "게시글 작성" : "게시글 수정"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <FormInputGroup
              form={form}
              handleChange={handleChange}
              isEdit={isEdit}
              existingTags={existingTags}
            />
            {form.boardTypeNo === 3 ? (
              <VideoUploader
                isEdit={isEdit}
                videoFile={videoFile}
                setVideoFile={setVideoFile}
                autoThumbnailFile={autoThumbnailFile}
                setAutoThumbnailFile={setAutoThumbnailFile}
                customThumbnailFile={customThumbnailFile}
                setCustomThumbnailFile={setCustomThumbnailFile}
                thumbnailMode={thumbnailMode}
                setThumbnailMode={setThumbnailMode}
                uploadProgress={uploadProgress}
                existingVideo={existingVideo}
                setExistingVideo={setExistingVideo}
                existingPhoto={existingPhoto}
                setExistingPhoto={setExistingPhoto}
                setExistingVideoNo={setExistingVideoNo}
              />
            ) : (
              <></>
            )}
            {/*       <PhotoUploader
                                    photoFiles={photoFiles}
                                    setPhotoFiles={setPhotoFiles}
                            />
                        */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                fontWeight: "bold",
                bgcolor: "#1565c0",
                ":hover": { bgcolor: "#90caf9" },
              }}
            >
              {!isEdit ? "등록하기" : "수정하기"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default BoardWrite;
