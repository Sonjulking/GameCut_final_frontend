import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Paper, Typography, Button, Stack } from "@mui/material";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const BoardDetail = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/board/${boardNo}`).then((res) => setBoard(res.data));
  }, [boardNo]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axiosInstance.delete(`/board/${boardNo}`);
    alert("삭제되었습니다.");
    navigate("/board/list");
  };

  if (!board) return <p style={{ color: "white" }}>로딩중...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={6} sx={{ bgcolor: "#1e1e1e", p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom color="white" fontWeight="bold">
          {board.boardTitle}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 5, color: "#cccccc" }}>
          {board.boardContent}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Link
            to={`/board/edit/${board.boardNo}`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              sx={{
                color: "#ffffff",
                borderColor: "#666666",
                "&:hover": { borderColor: "#ffffff" },
              }}
            >
              수정
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            sx={{
              backgroundColor: "#ff4d4f",
              "&:hover": { backgroundColor: "#ff3333" },
              color: "#ffffff",
            }}
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default BoardDetail;
