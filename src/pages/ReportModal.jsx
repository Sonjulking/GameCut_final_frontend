// components/ReportModal.jsx
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const ReportModal = ({ open, onClose, onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("신고 내용을 입력해주세요.");
      return;
    }

    onSubmit(content.trim());
    setContent("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
          신고하기
        </Typography>

        <TextField
          label="신고 내용"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          inputProps={{ maxLength: 200 }}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              color: "#fff", // 입력 텍스트 색상
            },
            "& .MuiInputLabel-root": {
              color: "#bbb", // 라벨 색상
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#666", // 테두리 색
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#999",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#58a6ff",
            },
          }}
          InputLabelProps={{ style: { color: "#bbb" } }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            취소
          </Button>
          <Button variant="contained" color="error" onClick={handleSubmit}>
            제출
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#1e1e1e",
  border: "1px solid #444",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

export default ReportModal;
