// 2025-07-14 생성됨 - 쪽지 상세 내용 팝업 컴포넌트 (읽음 기능 제거됨)
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Divider,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";

const MessageDetailPopup = ({ open, onClose, message, isSentTab }) => {
  if (!message) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          padding: "1.25rem",
          borderRadius: "0.75rem",
          minWidth: "25rem",
          maxWidth: "40rem",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          padding: "0 0 1rem 0",
        }}
      >
        <Typography variant="h6" component="span">
          쪽지 상세 내용
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 0 }}>
        <Stack spacing={2}>
          {/* 메시지 정보 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#aaa", marginBottom: "0.5rem" }}
            >
              {isSentTab ? "받는 사람" : "보낸 사람"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff" }}>
              {isSentTab
                ? message.receiveUserNickname || message.receiveUserNo
                : message.sendUserNickname || message.sendUserNo}
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#444" }} />

          {/* 날짜 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#aaa", marginBottom: "0.5rem" }}
            >
              전송 날짜
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff" }}>
              {format(new Date(message.messageDate), "yyyy년 MM월 dd일 HH:mm")}
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#444" }} />

          {/* 메시지 내용 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#aaa", marginBottom: "0.5rem" }}
            >
              내용
            </Typography>
            <Box
              sx={{
                backgroundColor: "#2e2e2e",
                padding: "1rem",
                borderRadius: "0.5rem",
                border: "1px solid #444",
                minHeight: "6rem",
                maxHeight: "20rem",
                overflowY: "auto",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#fff",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                }}
              >
                {message.messageContent}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDetailPopup;
