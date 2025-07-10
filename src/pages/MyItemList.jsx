import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myBoard.css";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import { useSelector } from "react-redux";

const MyItemList = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 알림 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    axios
      .get("/items/my")
      .then((res) => {
        setMyItems(res.data);
      })
      .catch((err) => {
        console.error("내 아이템 목록 불러오기 실패", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (itemNo) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await axios.delete(`/items/delete?itemNo=${itemNo}`);
      setMyItems((prev) => prev.filter((item) => item.itemNo !== itemNo));
      showSnackbar("아이템이 삭제되었습니다.", "success");
    } catch (err) {
      showSnackbar(err.response?.data || "삭제 실패", "error");
    }
  };

  const handleEquip = () => {
    showSnackbar("장착 기능은 현재 구현 중입니다.", "info");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <h2 className="mypage-section-title">내 아이템 목록</h2>
            {myItems.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 2 }}>
                아직 구매한 아이템이 없습니다.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {myItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.itemNo}>
                    <Card sx={{ backgroundColor: "#2a2a2a", color: "#fff" }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={`${import.meta.env.VITE_API_URL}${
                          item.itemImage?.fileUrl
                        }`}
                        alt={item.itemName}
                      />
                      <CardContent>
                        <Typography variant="h6">{item.itemName}</Typography>
                        <Typography variant="body2" color="#ccc">
                          가격: {item.itemPrice.toLocaleString()}P
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.itemNo)}
                          >
                            삭제
                          </Button>
                          {/* <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={handleEquip}
                          >
                            장착
                          </Button> */}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
          <MyPageSidebar />
        </div>
      </div>

      {/* 알림창 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MyItemList;
