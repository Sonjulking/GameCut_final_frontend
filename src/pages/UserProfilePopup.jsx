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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const UserProfilePopup = ({ open, onClose, user }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === "ROLE_ADMIN";

  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (open && !isLoggedIn) {
      // open 조건 추가
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [open, isLoggedIn, navigate]); // open 의존성 추가

  useEffect(() => {
    const checkStatuses = async () => {
      if (user?.userNo) {
        try {
          const followRes = await axiosInstance.get(
            `/api/follow/check?toUserNo=${user.userNo}`
          );
          setIsFollowing(followRes.data.isFollowing);

          const blockRes = await axiosInstance.get(
            `/api/block/check?blockedUserNo=${user.userNo}`
          );
          setIsBlocked(blockRes.data.isBlocked);
        } catch (err) {
          console.error("상태 확인 실패", err);
        }
      }
    };

    if (open) {
      checkStatuses();
      setMessageContent("");
    }
  }, [user, open]);

  const handleFollowToggle = async () => {
    try {
      const res = await axiosInstance.post(`/api/follow`, {
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

  const handleBlockToggle = async () => {
    try {
      if (isBlocked) {
        await axiosInstance.delete(`/api/block`, {
          data: { blockedUserNo: user.userNo },
        });
        alert("차단을 해제했습니다.");
        setIsBlocked(false);
      } else {
        await axiosInstance.post(`/api/block`, {
          blockedUserNo: user.userNo,
        });
        alert("사용자를 차단했습니다.");
        setIsBlocked(true);
      }
    } catch (err) {
      console.error("차단 처리 실패", err);
      alert("차단 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert("쪽지 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/message/send", {
        receiveUserNo: user.userNo,
        messageContent: messageContent.trim(),
      });

      if (res.data.success) {
        alert("쪽지를 보냈습니다!");
        setMessageContent("");
      } else {
        alert("쪽지 전송 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("쪽지 전송 실패", err);
      alert("쪽지 전송 중 오류가 발생했습니다.");
    }
  };

  const handleUserDelete = async () => {
    if (!window.confirm("정말로 이 사용자를 탈퇴시키겠습니까?")) return;

    try {
      const res = await axiosInstance.post(
        `/api/admin/user/delete/${user.userNo}`
      );
      if (res.data.success) {
        alert("유저가 탈퇴 처리되었습니다.");
        onClose();
      } else {
        alert("탈퇴 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("유저 탈퇴 실패", err);
      alert("유저 탈퇴 중 오류가 발생했습니다.");
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

          <TextField
            label="쪽지 내용"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{
              mt: 2,
              backgroundColor: "#2e2e2e",
              "& .MuiOutlinedInput-root": {
                "& textarea": {
                  color: "white", // 텍스트 색상
                },
              },
            }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />

          <Stack
            direction="row"
            spacing={2}
            sx={{ marginTop: 2, flexWrap: "wrap", justifyContent: "center" }}
          >
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
            <Button
              variant="outlined"
              color="error"
              onClick={handleBlockToggle}
              sx={{ borderColor: "#f44336", color: "#f44336" }}
            >
              {isBlocked ? "차단 해제" : "차단"}
            </Button>
            {isAdmin && (
              <Button
                variant="contained"
                color="error"
                onClick={handleUserDelete}
              >
                유저 탈퇴
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePopup;
