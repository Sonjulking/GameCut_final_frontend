import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // 여기에 백엔드 주소 작성
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const BoardUpdate = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ boardTitle: "", boardContent: "" });

  useEffect(() => {
    axiosInstance.get(`/board/${boardNo}`).then((res) => setForm(res.data));
  }, [boardNo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosInstance.put(`/board/${boardNo}`, form);
    alert("수정 완료");
    navigate(`/board/detail/${boardNo}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={6} sx={{ bgcolor: "#1e1e1e", p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom color="white" fontWeight="bold">
          게시글 수정
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="제목"
              name="boardTitle"
              value={form.boardTitle}
              onChange={handleChange}
              fullWidth
              InputProps={{
                style: { color: "#fff" },
              }}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#999" },
                },
              }}
            />
            <TextField
              label="내용"
              name="boardContent"
              value={form.boardContent}
              onChange={handleChange}
              multiline
              rows={8}
              fullWidth
              InputProps={{
                style: { color: "#fff" },
              }}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#999" },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                fontWeight: "bold",
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#0d47a1" },
              }}
            >
              수정하기
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default BoardUpdate;
