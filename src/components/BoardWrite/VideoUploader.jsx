// /components/BoardWrite/VideoUploader.jsx
import React, {useEffect, useRef} from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    LinearProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100mb

const VideoUploader = ({
    videoFile,
    setVideoFile,
    autoThumbnailFile,
    setAutoThumbnailFile,
    customThumbnailFile,
    setCustomThumbnailFile,
    thumbnailMode,
    setThumbnailMode,
    uploadProgress
}) => {
    const videoRef = useRef();

    useEffect(() => {
        if (thumbnailMode === "auto" && videoFile) {
            generateThumbnail(videoFile);
        }
    }, [thumbnailMode, videoFile]);

    const generateThumbnail = (file) => {
        const videoEl = document.createElement("video");
        videoEl.src = URL.createObjectURL(file);
        videoEl.crossOrigin = "anonymous";
        videoEl.muted = true;
        videoEl.playsInline = true;

        videoEl.addEventListener("loadedmetadata", () => {
            videoEl.currentTime = Math.min(0.5, videoEl.duration / 2);
        });

        videoEl.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const thumbnail = new File([blob], "auto_thumbnail.png", {type: "image/png"});
                    setAutoThumbnailFile(thumbnail);
                } else {
                    alert("썸네일 생성 실패: blob이 생성되지 않았습니다.");
                }
            }, "image/png");
        });

        videoEl.load();
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            setVideoFile(file);
            if (thumbnailMode === "auto") {
                generateThumbnail(file);
            }
        } else {
            alert("50MB 이하의 영상만 업로드 가능합니다.");
        }
    };

    const handleCustomThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            setCustomThumbnailFile(file);
        } else {
            alert("50MB 이하의 이미지만 업로드 가능합니다.");
        }
    };

    return (
            <>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon/>}>
                    동영상 업로드
                    <input type="file" hidden accept="video/*" onChange={handleVideoChange}/>
                </Button>

                {videoFile && (
                        <>
                            <Typography color="gray">{videoFile.name}</Typography>
                            <video
                                    ref={videoRef} src={URL.createObjectURL(videoFile)} controls
                                    style={{width: "100%", maxHeight: 300, borderRadius: 8}}
                            />
                            <IconButton
                                    onClick={() => {
                                        setVideoFile(null);
                                        setAutoThumbnailFile(null);
                                    }}
                            >
                                <DeleteIcon sx={{color: "red"}}/>
                            </IconButton>
                        </>
                )}

                <Box>
                    <Typography color="white">썸네일 선택 방식</Typography>
                    <RadioGroup
                            row value={thumbnailMode}
                            onChange={(e) => setThumbnailMode(e.target.value)}
                    >
                        <FormControlLabel
                                value="auto"
                                control={<Radio
                                        sx={{color: "#aaa", "&.Mui-checked": {color: "#42a5f5"}}}
                                />}
                                label="자동 생성"
                                sx={{color: "#fff"}}
                        />
                        <FormControlLabel
                                value="custom"
                                control={<Radio
                                        sx={{color: "#aaa", "&.Mui-checked": {color: "#42a5f5"}}}
                                />}
                                label="사용자 지정"
                                sx={{color: "#fff"}}
                        />
                    </RadioGroup>
                </Box>

                {thumbnailMode === "auto" && autoThumbnailFile && (
                        <Box>
                            <Typography color="gray">자동 생성 썸네일</Typography>
                            <img
                                    src={URL.createObjectURL(autoThumbnailFile)} alt="auto"
                                    style={{width: "100%", borderRadius: 8}}
                            />
                        </Box>
                )}

                {thumbnailMode === "custom" && (
                        <>
                            <Button
                                    variant="outlined" component="label"
                                    startIcon={<CloudUploadIcon/>}
                            >
                                썸네일 이미지 업로드
                                <input
                                        type="file" hidden accept="image/*"
                                        onChange={handleCustomThumbnailChange}
                                />
                            </Button>
                            {customThumbnailFile && (
                                    <Box>
                                        <Typography
                                                color="gray"
                                        >{customThumbnailFile.name}</Typography>
                                        <img
                                                src={URL.createObjectURL(customThumbnailFile)}
                                                alt="custom"
                                                style={{width: "100%", borderRadius: 8}}
                                        />
                                        <IconButton onClick={() => setCustomThumbnailFile(null)}>
                                            <DeleteIcon sx={{color: "red"}}/>
                                        </IconButton>
                                    </Box>
                            )}
                        </>
                )}

                {uploadProgress > 0 &&
                        <LinearProgress variant="determinate" value={uploadProgress}/>}
            </>
    );
};

export default VideoUploader;