import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Avatar,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import UserProfilePopup from "./UserProfilePopup";
import "../styles/AdminUserBoard.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminUserBoard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    } else if (user?.role !== "ROLE_ADMIN") {
      alert("권한이 없습니다.");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/user/listUser");
      setUsers(res.data);
    } catch (err) {
      console.error("회원 목록 불러오기 실패", err);
      alert("회원 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNicknameClick = (user, event) => {
    setSelectedUser(user);
    setPopupAnchor(event.currentTarget);
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
    setPopupAnchor(null);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) =>
    `${user.userNickname}${user.userId}`
      .toLowerCase()
      .includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="admin-user-board-container">
      <Typography variant="h4" className="admin-title">
        전체 회원 관리
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="아이디 또는 닉네임으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            style: { backgroundColor: "#2c2c2c", color: "#fff" },
          }}
          InputLabelProps={{
            style: { color: "#aaa" },
          }}
        />
      </Box>

      {/* 테이블을 모바일에서 스크롤 가능하게 만들기 */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <TableContainer component={Paper}>
            <Table className="admin-user-table">
              <TableHead>
                <TableRow>
                  <TableCell>번호</TableCell>
                  <TableCell>프로필</TableCell>
                  <TableCell>아이디</TableCell>
                  <TableCell>닉네임</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>전화번호</TableCell>
                  <TableCell>포인트</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell>탈퇴일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userNo}>
                    <TableCell>{user.userNo}</TableCell>
                    <TableCell>
                      <Avatar
                        src={
                          user.photo?.photoNo &&
                          user.photo.photoNo !== 0 &&
                          user.photo.attachFile?.fileUrl
                            ? `${import.meta.env.VITE_API_URL}${
                                user.photo.attachFile.fileUrl
                              }`
                            : "/src/assets/img/main/icons/profile_icon.png"
                        }
                        alt={user.userNickname}
                        sx={{ width: 32, height: 32, margin: "0 auto" }}
                      />
                    </TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>
                      <span
                        className="nickname-link"
                        onClick={(e) => handleNicknameClick(user, e)}
                      >
                        {user.userNickname}
                      </span>
                    </TableCell>
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.userPoint?.toLocaleString()}P</TableCell>
                    <TableCell>
                      {user.userCreateDate
                        ? new Date(user.userCreateDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {user.userDeleteDate
                        ? new Date(user.userDeleteDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* 모바일에서 카드형 레이아웃 적용 */}
        <div className="admin-table-card-view">
          <Grid container spacing={2}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.userNo}>
                <Card className="admin-card">
                  <CardContent>
                    <Avatar
                      src={
                        user.photo?.photoNo &&
                        user.photo.photoNo !== 0 &&
                        user.photo.attachFile?.fileUrl
                          ? `${import.meta.env.VITE_API_URL}${
                              user.photo.attachFile.fileUrl
                            }`
                          : "/src/assets/img/main/icons/profile_icon.png"
                      }
                      alt={user.userNickname}
                      sx={{ width: 50, height: 50, margin: "0 auto" }}
                    />
                    <Typography variant="h6">{user.userNickname}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.userName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      아이디: {user.userId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      전화번호: {user.phone}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      포인트: {user.userPoint?.toLocaleString()}P
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      가입일:{" "}
                      {user.userCreateDate
                        ? new Date(user.userCreateDate).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>

      {selectedUser && (
        <UserProfilePopup
          open={Boolean(selectedUser)}
          user={selectedUser}
          onClose={handleClosePopup}
        />
      )}
    </Box>
  );
};

export default AdminUserBoard;
