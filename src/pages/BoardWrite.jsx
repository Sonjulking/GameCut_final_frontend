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
    const [videoFile, setVideoFile] = useState(null);
    const [autoThumbnailFile, setAutoThumbnailFile] = useState(null);
    const [customThumbnailFile, setCustomThumbnailFile] = useState(null);
    const [thumbnailMode, setThumbnailMode] = useState("auto");
    const [photoFiles, setPhotoFiles] = useState([]);
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

        if (form.boardTypeNo === 3) {
            if (videoFile) formData.append("file", videoFile);
            if (thumbnailMode === "auto" && autoThumbnailFile) {
                formData.append("thumbnail", autoThumbnailFile);
            } else if (thumbnailMode === "custom" && customThumbnailFile) {
                formData.append("thumbnail", customThumbnailFile);
            }
        } else {
            photoFiles.forEach((file) => formData.append("file", file));
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/board`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setUploadProgress(percent);
                }
            });
            alert("게시글이 등록되었습니다!");
        } catch (err) {
            console.error(err);
            alert("등록 실패");
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
                                    <PhotoUploader
                                            photoFiles={photoFiles}
                                            setPhotoFiles={setPhotoFiles}
                                    />
                            )}
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
