import React, {useState, useEffect, useRef} from "react";
import {
    Box, Button, Container, FormControl, InputLabel, MenuItem, Select, TextField,
    Typography, Stack, Paper, IconButton, LinearProgress, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
    const [thumbnailMode, setThumbnailMode] = useState("auto"); // 'auto' or 'custom'
    const [photoFiles, setPhotoFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const videoRef = useRef();
    useEffect(() => {
        if (thumbnailMode === "auto" && videoFile) {
            generateThumbnail(videoFile);
        }
    }, [thumbnailMode, videoFile]);
    useEffect(() => {
        return () => {
            if (videoFile) URL.revokeObjectURL(videoFile);
            if (autoThumbnailFile) URL.revokeObjectURL(autoThumbnailFile);
            if (customThumbnailFile) URL.revokeObjectURL(customThumbnailFile);
            photoFiles.forEach(f => URL.revokeObjectURL(f));
        };
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleThumbnailTypeChange = (e) => {
        setThumbnailMode(e.target.value);
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

    const generateThumbnail = (file) => {
        const videoEl = document.createElement("video");
        videoEl.src = URL.createObjectURL(file);
        videoEl.crossOrigin = "anonymous";
        videoEl.muted = true;
        videoEl.playsInline = true;

        videoEl.addEventListener("loadedmetadata", () => {
            // 영상 길이 정보가 로드되면 0.5초쯤으로 이동 (짧은 영상 대비)
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

        videoEl.load(); // 로딩 시작
    };


    const handleCustomThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            setCustomThumbnailFile(file);
        } else {
            alert("50MB 이하의 이미지만 업로드 가능합니다.");
        }
    };

    const handlePhotoFilesChange = (e) => {
        const files = Array.from(e.target.files).filter(f => f.size <= MAX_FILE_SIZE);
        if (files.length !== e.target.files.length) alert("50MB 이하의 이미지만 허용됩니다.");
        setPhotoFiles(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f =>
                f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE
        );
        if (files.length === 0) {
            alert("이미지 파일만 드래그해주세요. (50MB 이하)");
            return;
        }
        setPhotoFiles(prev => [...prev, ...files]);
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
                        sx={{bgcolor: "#1a1a1a", p: 4, borderRadius: 3}}
                >
                    <Typography
                            variant="h4"
                            gutterBottom
                            color="white"
                            fontWeight="bold"
                    >
                        게시글 작성
                    </Typography>

                    <FormControl
                            fullWidth
                            sx={{mb: 3}}
                    >
                        <InputLabel sx={{color: "#ccc"}}>게시판 타입</InputLabel>
                        <Select
                                name="boardTypeNo"
                                value={form.boardTypeNo}
                                onChange={handleChange}
                                sx={{
                                    color: "#fff",
                                    backgroundColor: "#2b2b2b",
                                    "& .MuiOutlinedInput-notchedOutline": {borderColor: "#555"},
                                    "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "#999"},
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "#1976d2"}
                                }}
                        >
                            <MenuItem value={1}>자유게시판</MenuItem>
                            <MenuItem value={2}>공지사항</MenuItem>
                            <MenuItem value={3}>유저영상</MenuItem>
                        </Select>
                    </FormControl>

                    <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                    >
                        <Stack spacing={3}>
                            <TextField
                                    name="boardTitle"
                                    label="제목"
                                    value={form.boardTitle}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{style: {color: "#ccc"}}}
                                    sx={{
                                        input: {color: "#fff"},
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {borderColor: "#555"},
                                            "&:hover fieldset": {borderColor: "#999"},
                                            "&.Mui-focused fieldset": {borderColor: "#1976d2"}
                                        }
                                    }}
                            />
                            <TextField
                                    name="boardContent"
                                    label="내용"
                                    multiline
                                    rows={4}
                                    value={form.boardContent}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{style: {color: "#ccc"}}}
                                    sx={{
                                        textarea: {color: "#fff"},
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {borderColor: "#555"},
                                            "&:hover fieldset": {borderColor: "#999"},
                                            "&.Mui-focused fieldset": {borderColor: "#1976d2"}
                                        }
                                    }}
                            />

                            {form.boardTypeNo === 3 ? (
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
                                        {videoFile && (
                                                <>
                                                    <Typography color="gray">{videoFile.name}</Typography>
                                                    <video
                                                            ref={videoRef}
                                                            src={URL.createObjectURL(videoFile)}
                                                            controls
                                                            style={{
                                                                width: "100%",
                                                                maxHeight: 300,
                                                                borderRadius: 8
                                                            }}
                                                    />
                                                    <IconButton
                                                            onClick={() => {
                                                                setVideoFile(null);
                                                                setAutoThumbnailFile(null); // 자동 생성 썸네일도 제거
                                                            }}
                                                    ><DeleteIcon sx={{color: "red"}}/></IconButton>
                                                </>
                                        )}

                                        {/* 썸네일 선택 */}
                                        <Box>
                                            <Typography color="white">썸네일 선택 방식</Typography>
                                            <RadioGroup row value={thumbnailMode} onChange={handleThumbnailTypeChange}>
                                                <FormControlLabel
                                                        value="auto"
                                                        control={
                                                            <Radio
                                                                    sx={{
                                                                        color: "#aaa", // 체크 안 된 색상
                                                                        '&.Mui-checked': {
                                                                            color: "#42a5f5" // 체크된 색상 (하늘색)
                                                                        }
                                                                    }}
                                                            />
                                                        }
                                                        label="자동 생성"
                                                        sx={{ color: "#fff" }} // 라벨 텍스트 색상
                                                />
                                                <FormControlLabel
                                                        value="custom"
                                                        control={
                                                            <Radio
                                                                    sx={{
                                                                        color: "#aaa",
                                                                        '&.Mui-checked': {
                                                                            color: "#42a5f5"
                                                                        }
                                                                    }}
                                                            />
                                                        }
                                                        label="사용자 지정"
                                                        sx={{ color: "#fff" }}
                                                />
                                            </RadioGroup>
                                        </Box>

                                        {/* 자동 썸네일 미리보기 */}
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

                                        {/* 사용자 지정 썸네일 업로드 */}
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
                                                                <Typography color="gray">{customThumbnailFile.name}</Typography>
                                                                <img
                                                                        src={URL.createObjectURL(customThumbnailFile)}
                                                                        alt="custom"
                                                                        style={{
                                                                            width: "100%",
                                                                            borderRadius: 8
                                                                        }}
                                                                />
                                                                <IconButton onClick={() => setCustomThumbnailFile(null)}><DeleteIcon sx={{color: "red"}}/></IconButton>
                                                            </Box>
                                                    )}
                                                </>
                                        )}

                                        {uploadProgress > 0 && <LinearProgress
                                                variant="determinate"
                                                value={uploadProgress}
                                        />}
                                    </>
                            ) : (
                                    <>
                                        <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                        >
                                            이미지 업로드 (또는 드래그)
                                            <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePhotoFilesChange}
                                            />
                                        </Button>
                                        <Stack
                                                direction="row"
                                                spacing={2}
                                                flexWrap="wrap"
                                        >
                                            {photoFiles.map((file, idx) => (
                                                    <Box
                                                            key={idx}
                                                            sx={{position: "relative"}}
                                                    >
                                                        <Typography
                                                                color="gray"
                                                                variant="caption"
                                                        >{file.name}</Typography>
                                                        <img
                                                                src={URL.createObjectURL(file)}
                                                                alt="img"
                                                                style={{
                                                                    width: 100,
                                                                    height: 100,
                                                                    objectFit: "cover",
                                                                    borderRadius: 6
                                                                }}
                                                        />
                                                        <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    const newFiles = [...photoFiles];
                                                                    newFiles.splice(idx, 1);
                                                                    setPhotoFiles(newFiles);
                                                                }}
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    right: 0
                                                                }}
                                                        >
                                                            <DeleteIcon
                                                                    fontSize="small"
                                                                    sx={{color: "red"}}
                                                            />
                                                        </IconButton>
                                                    </Box>
                                            ))}
                                        </Stack>
                                    </>
                            )}

                            <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        fontWeight: "bold",
                                        bgcolor: "#1976d2",
                                        ":hover": {bgcolor: "#1565c0"}
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
