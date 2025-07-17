// 2025-07-16 수정됨 - 내 아이템 목록 페이지 스타일 개선 (다른 마이페이지와 통일)
import React, { useEffect, useState } from "react";
import { Grid, CircularProgress, Snackbar, Alert } from "@mui/material";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myItemList.css"; // ⚠️ 새 CSS 파일
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../lib/axiosInstance";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyItemList = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 알림 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

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
    axiosInstance
      .get("/api/items/my")
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
      await axiosInstance.delete(`/api/items/delete?itemNo=${itemNo}`);
      setMyItems((prev) => prev.filter((item) => item.itemNo !== itemNo));
      showSnackbar("아이템이 삭제되었습니다.", "success");
    } catch (err) {
      showSnackbar(err.response?.data || "삭제 실패", "error");
    }
  };
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSidebar();
  };

  if (loading) {
    return (
      <div className="item-container">
        <div className="item-content">
          <div className="item-wrapper">
            <div className="item-section">
              <div className="loading-container">
                <CircularProgress sx={{ color: "#58a6ff", mb: 2 }} />
                <p className="loading-text">아이템 목록을 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="item-container">
      <div className="item-content">
        <div className="item-wrapper">
          <div className="item-section">
            <button
              className="mypage-mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>
            <div className="item-header">
              <h2 className="item-section-title">내 아이템 목록</h2>
            </div>
            <br />
            <br />
            {myItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💺</div>
                <h3 className="empty-title">아직 구매한 아이템이 없습니다</h3>
                <button
                  className="go-to-shop-btn"
                  onClick={() => navigate("/itemshop")}
                >
                  아이템 샵 바로가기
                </button>
              </div>
            ) : (
              <Grid container spacing={2}>
                {myItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.itemNo}>
                    <div className="item-card">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          item.itemImage?.fileUrl
                        }`}
                        alt={item.itemName}
                        height="160"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="item-card-content">
                        <h3 className="item-name">{item.itemName}</h3>
                        <p className="item-price">
                          가격: {item.itemPrice.toLocaleString()}P
                        </p>
                        <div className="item-button-group">
                          <button
                            className="item-button delete"
                            onClick={() => handleDelete(item.itemNo)}
                          >
                            삭제
                          </button>
                          {/* <button
                            className="item-button equip"
                            onClick={handleEquip}
                          >
                            장착
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          {/* 2025-07-15 수정됨 - 사이드바에 상태 props 전달 */}
          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
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
