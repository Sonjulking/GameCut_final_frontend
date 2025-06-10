import React, {useState} from "react";
import {
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Stack
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

const BoardWrite = () => {
    const [form, setForm] = useState({
        boardTitle: "",
        boardContent: "",
        boardTypeNo: 1,
        userNo: 1 // 로그인 상태에서 받아야 함
    });
    const [videoFile, setVideoFile] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);

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

        if (videoFile) formData.append("video", videoFile);
        photoFiles.forEach((file) => formData.append("photos", file));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/board`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("게시글이 등록되었습니다!");
        } catch (err) {
            console.error(err);
            alert("등록 실패");
        }
    };

    return (
            <Container
                    maxWidth="sm"
                    sx={{
                        mt: 5,
                        backgroundColor: "#121212", // 다크 배경
                        padding: 4,
                        borderRadius: 2,
                        color: "#fff",
                        boxShadow: 3
                    }}
            >
                <Typography variant="h4" gutterBottom color="white">
                    게시글 작성
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 2}}>
                    <Stack spacing={2}>
                        <TextField
                                name="boardTitle"
                                label="제목"
                                value={form.boardTitle}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ style: { color: '#ccc' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#bbb', // 기본 테두리
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#ddd', // 호버 시 밝게
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#fff', // 포커스 시 더 밝게
                                        },
                                        color: '#fff', // 텍스트 색상
                                    }
                                }}
                        />

                        <TextField
                                name="boardContent"
                                label="내용"
                                multiline
                                rows={5}
                                value={form.boardContent}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ style: { color: '#ccc' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#bbb',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#ddd',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#fff',
                                        },
                                        color: '#fff',
                                    }
                                }}
                        />

                        <FormControl fullWidth>
                            <InputLabel sx={{color: "#ccc"}}>게시판 타입</InputLabel>
                            <Select
                                    name="boardTypeNo"
                                    value={form.boardTypeNo}
                                    onChange={handleChange}
                                    label="게시판 타입"
                                    sx={{
                                        color: "#fff",
                                        ".MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#555"
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#888"
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#aaa"
                                        },
                                        backgroundColor: "#1e1e1e"
                                    }}
                            >
                                <MenuItem value={1}>자유게시판</MenuItem>
                                <MenuItem value={2}>유저영상</MenuItem>
                                <MenuItem value={3}>공지사항</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon/>}
                                sx={{
                                    color: "#ccc",
                                    borderColor: "#555",
                                    ":hover": {borderColor: "#888"}
                                }}
                        >
                            비디오 업로드
                            <input
                                    type="file" hidden accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                            />
                        </Button>
                        <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon/>}
                                sx={{
                                    color: "#ccc",
                                    borderColor: "#555",
                                    ":hover": {borderColor: "#888"}
                                }}
                        >
                            이미지 업로드 (다중 선택)
                            <input
                                    type="file" hidden multiple accept="image/*"
                                    onChange={(e) => setPhotoFiles([...e.target.files])}
                            />
                        </Button>
                        <Button
                                variant="contained" type="submit" fullWidth
                                sx={{backgroundColor: "#1976d2"}}
                        >
                            등록하기
                        </Button>
                    </Stack>
                </Box>
            </Container>
    );
};

export default BoardWrite;
