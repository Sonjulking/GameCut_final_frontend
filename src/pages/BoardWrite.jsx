// /components/BoardWrite/BoardWrite.jsx
import React, {useState} from "react";
import {Container, Paper, Typography, Button, Stack, Box} from "@mui/material";
import FormInputGroup from "../components/BoardWrite/FormInputGroup.jsx";
import VideoUploader from "../components/BoardWrite/VideoUploader";
import PhotoUploader from "../components/BoardWrite/PhotoUploader";
import axios from "axios";

const BoardWrite = () => {
    const [form, setForm] = useState({
        boardTitle: "",
        boardContent: "",
        boardTypeNo: 1,
        userNo: 1
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
        setForm({...form, [name]: value});
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

            //썸네일 처리
            if (thumbnailMode === "auto" && autoThumbnailFile) {
                formData.append("thumbnail", autoThumbnailFile);
            } else if (thumbnailMode === "custom" && customThumbnailFile) {
                formData.append("thumbnail", customThumbnailFile);
            }
        } else { //사진 처리
            photoFiles.forEach((file) => formData.append("file", file));
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/board`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
                //업로드 진행률을 추적하는 콜백함수
                onUploadProgress: (e) => {
                    //퍼센트로 변환
                    const percent = Math.round((e.loaded * 100) / e.total);
                    //계산된 퍼센트를 state에 저장
                    setUploadProgress(percent);
                }
            });
            alert("게시글이 등록되었습니다.");
        } catch (err) {
            console.error(err);
            alert("게시글이 등록실패했습니다.");
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
                        게시글 작성
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
                            />
                            {form.boardTypeNo === 3 ? (
                                    <VideoUploader
                                            videoFile={videoFile}
                                            setVideoFile={setVideoFile}
                                            autoThumbnailFile={autoThumbnailFile}
                                            setAutoThumbnailFile={setAutoThumbnailFile}
                                            customThumbnailFile={customThumbnailFile}
                                            setCustomThumbnailFile={setCustomThumbnailFile}
                                            thumbnailMode={thumbnailMode}
                                            setThumbnailMode={setThumbnailMode}
                                            uploadProgress={uploadProgress}
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
                                등록하기
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
    );
};

export default BoardWrite;
