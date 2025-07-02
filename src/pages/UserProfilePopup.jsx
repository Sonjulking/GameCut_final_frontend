import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Button,
  Typography,
  Stack,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../lib/axiosInstance";

const UserProfilePopup = ({ open, onClose, user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && user.userNo) {
        try {
          const res = await axiosInstance.get(
            `/follow/check?toUserNo=${user.userNo}`
          );
          setIsFollowing(res.data.isFollowing);
        } catch (err) {
          console.error("팔로우 상태 확인 실패", err);
        }
      }
    };

    if (open) {
      checkFollowStatus();
      setMessageContent(""); // 새로 열 때 내용 초기화
    }
  }, [user, open]);

  const handleFollowToggle = async () => {
    try {
      const res = await axiosInstance.post(`/follow`, {
        toUserNo: user.userNo,
      });

      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
      }
    } catch (err) {
      console.error("팔로우 요청 실패", err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert("쪽지 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await axiosInstance.post("/message/send", {
        receiveUserNo: user.userNo,
        messageContent: messageContent.trim(),
      });

      if (res.data.success) {
        alert("쪽지를 보냈습니다!");
        setMessageContent(""); // 입력값 초기화
      } else {
        alert("쪽지 전송 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("쪽지 전송 실패", err);
      alert("쪽지 전송 중 오류가 발생했습니다.");
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "350px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <span>{user.userNickname}님의 프로필</span>
        <IconButton onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <Avatar
            src={
              user.photo?.fileUrl &&
              import.meta.env.VITE_API_URL + user.photo.fileUrl
            }
            alt={user.userNickname}
            sx={{ width: 100, height: 100 }}
          />
          <Typography>ID: {user.userId}</Typography>
          <Typography>닉네임: {user.userNickname}</Typography>

          {/* ✅ 쪽지 입력칸 추가 */}
          <TextField
            label="쪽지 내용"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{ mt: 2, backgroundColor: "#2e2e2e", input: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />

          {/* 버튼들 */}
          <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
            >
              쪽지 보내기
            </Button>
            <Button
              variant="outlined"
              onClick={handleFollowToggle}
              sx={{ color: "#fff", borderColor: "#777" }}
            >
              {isFollowing ? "팔로우 취소" : "팔로우"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePopup;
