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
} from "@mui/material";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css"; // 기존 마이페이지 스타일 유지

const MyItemList = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/items/my") // 백엔드에서 로그인한 유저의 구매 아이템 리스트 반환
      .then((res) => {
        setMyItems(res.data); // [{itemNo, itemName, itemPrice, itemImage: {fileUrl, ...}}]
      })
      .catch((err) => {
        console.error("내 아이템 목록 불러오기 실패", err);
      })
      .finally(() => setLoading(false));
  }, []);

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
    </div>
  );
};

export default MyItemList;
