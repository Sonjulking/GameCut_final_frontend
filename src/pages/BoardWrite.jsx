// /components/BoardWrite/BoardWrite.jsx
import React, {useEffect, useState} from "react";
import {Container, Paper, Typography, Button, Stack, Box} from "@mui/material";
import FormInputGroup from "../components/BoardWrite/FormInputGroup.jsx";
import VideoUploader from "../components/BoardWrite/VideoUploader";
import PhotoUploader from "../components/BoardWrite/PhotoUploader";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";

const BoardWrite = ({isEdit = false}) => {
    const navigate = useNavigate(); // 추가
    const {boardNo} = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [existingVideo, setExistingVideo] = useState({});
    const [existingPhoto, setExistingPhoto] = useState({});
    const [existingVideoNo, setExistingVideoNo] = useState({});
    useEffect(() => {
        if (isEdit && boardNo) {
            axios.get(`${import.meta.env.VITE_API_URL}/board/${boardNo}`)
                    .then((res) => {
                        const data = res.data;

                        const tagList = data.video?.tagByVideoList?.map(
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
        const {name, value} = e.target;

        if (name === "videoTags" && Array.isArray(value)) {
            setForm((prev) => ({...prev, videoTags: value})); // 배열 그대로
        } else {
            setForm((prev) => ({...prev, [name]: value}));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("boardTitle", form.boardTitle);
        formData.append("boardContent", form.boardContent);
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

        } else { //사진 처리
            photoFiles.forEach((file) => formData.append("file", file));
        }

        try {
            const token = localStorage.getItem("token");
            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            };
            if (isEdit) {
                await axios.put(`${import.meta.env.VITE_API_URL}/board/${boardNo}`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data"
                    },
                    //업로드 진행률을 추적하는 콜백함수
                    onUploadProgress: (e) => {
                        //퍼센트로 변환
                        const percent = Math.round((e.loaded * 100) / e.total);
                        //계산된 퍼센트를 state에 저장
                        setUploadProgress(percent);
                    }
                });
                alert("게시글이 수정되었습니다.");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/board`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data"
                    },
                    //업로드 진행률을 추적하는 콜백함수
                    onUploadProgress: (e) => {
                        //퍼센트로 변환
                        const percent = Math.round((e.loaded * 100) / e.total);
                        //계산된 퍼센트를 state에 저장
                        setUploadProgress(percent);
                    }
                });
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
                    sx={{mt: 5, pb: 10}}
            >
                <Paper
                        elevation={6}
                        sx={{
                            bgcolor: "#1a1a1a",
                            p: 4,
                            borderRadius: 3,
                            border: "1px solid #555"
                        }}
                >
                    <Typography
                            variant="h4"
                            gutterBottom
                            color="white"
                            fontWeight="bold"
                    >
                        {!isEdit ? "게시글 작성" : "게시글 수정"}
                    </Typography>

                    <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                    >
                        <Stack spacing={3}>
                            <FormInputGroup
                                    form={form}
                                    handleChange={handleChange}
                                    isEdit={isEdit}
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
                                    <>
                                    </>
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
                                        ":hover": {bgcolor: "#90caf9"}
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
