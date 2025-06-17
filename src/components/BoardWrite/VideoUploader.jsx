// /components/BoardWrite/VideoUploader.jsx
import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    LinearProgress, TextField
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {useDebounce} from "../../hooks/useDebounce.jsx";

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
    uploadProgress,
    isEdit,
    existingVideo,
    setExistingVideo,
    setExistingVideoNo,
    existingPhoto,
    setExistingPhoto
}) => {
    //useRef()는 특정 DOM 요소나 값에 직접 접근하고 조작하고 싶을 때 사용하는 Hook
    const videoRef = useRef(null);

    //썸네일 텍스트 상태 추가
    const [thumbnailText, setThumbnailText] = useState("");
    const debouncedText = useDebounce(thumbnailText, 300);

    const videoURL = useMemo(() => {
        return videoFile ? URL.createObjectURL(videoFile) : null;
    }, [videoFile]);

    useEffect(() => {
        if (thumbnailMode === "auto" && videoFile) {
            generateThumbnail(videoFile);
        }
    }, [thumbnailMode, videoFile, debouncedText]);

    useEffect(() => {
        if (existingPhoto) {
            setThumbnailMode("existingPhoto");
        }
    }, [existingPhoto]);
    //썸네일 자동 생성
    const generateThumbnail = (file) => {
        setExistingPhoto(null);
        //브라우저 메모리에서 사용할 빋오 요소 생성(화면에 표시안됨)
        const videoEl = document.createElement("video");

        //업로드된 비디오 파일을 브라우저에서 재생가능한 임시 URL로 변환
        videoEl.src = URL.createObjectURL(file);

        //CORS 문제 방지 (다른 출처의 비디오도 캡처 가능하게 설정)
        videoEl.crossOrigin = "anonymous";

        //자동ㅈ생을 허용하기 위해 음소거 설정 (브라우저 정책 대응)
        videoEl.muted = true;

        //모바일에서 전체화면이 아닌 inline 재생 허용 (iOS 대응)
        videoEl.playsInline = true;

        //메타데이터가 로드되면 (영상 길이 등 정보 파악됨)
        videoEl.addEventListener("loadedmetadata", () => {
            //0.5초 또는, 영상의 절반 길이중 짧은쪽 선택
            //0.8초짜리 영상이면 0.4 vs 0.5 =>  0.4초
            //30초짜리 영상이면 0.5초 vs 15 => 0.5초
            videoEl.currentTime = Math.min(0.5, videoEl.duration / 2);
        });

        //비대오 재생위치로 이동했을때
        videoEl.addEventListener("seeked", () => {
            //비디오 비율 (가로 영상인지, 세로 영상인지)
            const videoRatio = videoEl.videoWidth / videoEl.videoHeight;
            //썸네일 이미지를 그릴 캔버스 요소 생성

            const targetWidth = 640;
            const targetHeight = Math.round(targetWidth / videoRatio); // 세로영상이면 높이가 더 길어짐

            // 썸네일 이미지를 그릴 캔버스 요소 생성
            const canvas = document.createElement("canvas");

            //HTML <canvas> 요소에서 그림을 그릴 수 있도록 "그리기 도구(context)"를 꺼내는 코드
            const ctx = canvas.getContext("2d");
            canvas.width = targetWidth; //너비
            canvas.height = targetHeight; //높이
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            //썸네일 텍스트가 있을 때만 그리기
            if (debouncedText.trim() !== "") {
                // 배경 어둡게 덧씌우기 (반투명 블랙 오버레이)
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = "bold 48px 'Malgun Gothic', 'Segoe UI', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // 그림자 효과로 시인성 향상
                ctx.shadowColor = "black";
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.fillStyle = "white";

                // 중앙에 큰 텍스트 표시
                ctx.fillText(debouncedText, canvas.width / 2, canvas.height / 2);
            }

            canvas.toBlob(blob => {
                if (blob) {
                    const thumbnail = new File([blob], "auto_thumbnail.png", {type: "image/png"});
                    setAutoThumbnailFile(thumbnail);
                } else {
                    alert("썸네일 생성 실패: blob이 생성되지 않았습니다.");
                }
            }, "image/png");
        });

        //비디오 요소를 강제 로드 (loadedmetadata 이벤트 트리거를 위해)
        videoEl.load();
    };

    //비디오 업로드
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            // 기존 데이터 초기화
            setVideoFile(null);               // 기존 파일 제거
            setAutoThumbnailFile(null);       // 자동 썸네일 제거
            setCustomThumbnailFile(null);     // 커스텀 썸네일 제거
            setExistingVideo("");             // 기존 비디오 정보 제거
            setExistingVideoNo(null);             // 기존 비디오 정보 제거
            setExistingPhoto(null); //  기존 썸네일 제거
            setThumbnailMode("auto");         // 썸네일 모드 초기화
            setThumbnailText("");             // 썸네일 텍스트 초기화

            // 새 파일 적용 및 썸네일 생성
            setVideoFile(file);
            if (thumbnailMode === "auto") {
                generateThumbnail(file);
            }
        } else {
            alert("100MB 이하의 영상만 업로드 가능합니다.");
        }
    };

    const fetchVideoAsFile = async (url, fileName) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], fileName, {type: blob.type});
    };

    useEffect(() => {
        const initExistingVideo = async () => {
            if (existingVideo.fileUrl && !videoFile) {
                const fullUrl = import.meta.env.VITE_API_URL + existingVideo.fileUrl;
                const file = await fetchVideoAsFile(fullUrl, existingVideo.originalFileName || "video.mp4");
                setVideoFile(file);
            }
        };
        initExistingVideo();
    }, [existingVideo]);
    //커스텀 섬네일 업로드
    const handleCustomThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            setCustomThumbnailFile(file);
            setExistingPhoto(null);
        } else {
            alert("100MB 이하의 이미지만 업로드 가능합니다.");
        }
    };

    return (
            <>
                <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon/>}
                >
                    동영상 업로드
                    <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={handleVideoChange}
                    />
                </Button>

                {(existingVideo.fileUrl || videoFile) && (
                        <>
                            {videoFile ? <Typography color="gray">{videoFile.name}</Typography> :
                                    <Typography
                                            color="gray"
                                    >{existingVideo.originalFileName}</Typography>}
                            {existingVideo.fileUrl ?
                                    <video
                                            ref={videoRef}
                                            src={`${import.meta.env.VITE_API_URL}` + existingVideo.fileUrl}
                                            controls
                                            style={{width: "100%", maxHeight: 300, borderRadius: 8}}
                                    /> : <video
                                            ref={videoRef}
                                            src={videoURL}
                                            controls
                                            style={{width: "100%", maxHeight: 300, borderRadius: 8}}
                                    />}

                            {/*삭제버튼*/}
                            <IconButton
                                    onClick={() => {
                                        setVideoFile(null);
                                        setAutoThumbnailFile(null);
                                        setExistingVideo("");
                                    }}
                            >
                                <DeleteIcon sx={{color: "red"}}/>
                            </IconButton>
                        </>
                )}

                <Box>
                    <Typography color="white">썸네일 선택 방식</Typography>
                    <RadioGroup
                            row
                            value={thumbnailMode}
                            onChange={(e) => setThumbnailMode(e.target.value)}
                    >

                        {existingPhoto?.fileUrl &&
                                <FormControlLabel
                                        value="existingPhoto"
                                        control={<Radio
                                                sx={{
                                                    color: "#aaa",
                                                    "&.Mui-checked": {color: "#42a5f5"}
                                                }}
                                        />}
                                        label="기존 썸네일"
                                        sx={{color: "#fff"}}
                                />
                        }
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
                {thumbnailMode === "auto" && (
                        <TextField
                                label="썸네일 텍스트"
                                value={thumbnailText}
                                onChange={(e) => setThumbnailText(e.target.value)}
                                placeholder="텍스트를 입력하세요 (선택)"
                                InputLabelProps={{style: {color: "#ccc"}}}
                                sx={{
                                    input: {color: "#fff"},
                                    width: "100%",
                                    mt: 2,
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {borderColor: "#555"},
                                        "&:hover fieldset": {borderColor: "#999"},
                                        "&.Mui-focused fieldset": {borderColor: "#1976d2"}
                                    }
                                }}
                        />

                )}
                {existingPhoto?.fileUrl && thumbnailMode === "existingPhoto" && (
                        <Box>
                            <Typography color="gray">기존 썸네일</Typography>
                            <img
                                    src={`${import.meta.env.VITE_API_URL}` + existingPhoto.fileUrl}
                                    alt="auto"
                                    style={{width: "100%", borderRadius: 8}}
                            />
                        </Box>
                )}

                {thumbnailMode === "auto" && autoThumbnailFile && (
                        <Box>
                            <Typography color="gray">자동 생성 썸네일</Typography>
                            <img
                                    src={URL.createObjectURL(autoThumbnailFile)}
                                    alt="auto"
                                    style={{width: "100%", borderRadius: 8}}
                            />
                        </Box>
                )}

                {thumbnailMode === "custom" && (
                        <>
                            <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon/>}
                            >
                                썸네일 이미지 업로드
                                <input
                                        type="file"
                                        hidden
                                        accept="image/*"
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
                        <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                        />}
            </>
    );
};

export default VideoUploader;