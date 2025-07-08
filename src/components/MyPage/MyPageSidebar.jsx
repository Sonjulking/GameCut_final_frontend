import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../lib/axiosInstance";
import "../../styles/MyPageSidebar.css";

const MyPageSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    { id: "info", name: "내 정보", path: "/mypage/info" },
    { id: "message", name: "내 쪽지", path: "/mypage/message" },
    { id: "board", name: "내 게시글", path: "/mypage/board" },
    { id: "comment", name: "내 댓글", path: "/mypage/comment" },
    // { id: "video", name: "내 영상", path: "/mypage/video" },
    { id: "item", name: "내 아이템", path: "/mypage/item" },
    { id: "point", name: "내 포인트 내역", path: "/mypage/point" },
    { id: "follow", name: "팔로우", path: "/mypage/follow" },
    { id: "gtr", name: "게스더랭크 기록", path: "/mypage/gtr" },
    { id: "report", name: "신고 기록", path: "/mypage/report" },
  ];

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === "/mypage/info") return "info";
    if (path === "/mypage/board") return "board";
    if (path === "/mypage/message") return "message";
    if (path === "/mypage/comment") return "comment";
    if (path === "/mypage/video") return "video";
    if (path === "/mypage/item") return "item";
    if (path === "/mypage/point") return "point";
    if (path === "/mypage/follow") return "follow";
    if (path === "/mypage/gtr") return "gtr";
    if (path === "/mypage/report") return "report";
    if (path === "/mypage/admin") return "admin";
    return "info";
  };

  const activeMenu = getActiveMenu();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get("/message/unread/count");
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("안 읽은 쪽지 수 조회 실패", err);
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <div className="mypage-sidebar">
      <h2 className="mypage-title">마이페이지</h2>

      <nav className="mypage-menu">
        {/* ✅ 관리자 전용 메뉴 */}
        {user?.role === "ROLE_ADMIN" && (
          <button
            onClick={() => navigate("/mypage/admin")}
            className="mypage-menu-item admin-button"
            title="관리자 페이지"
          >
            <span className="menu-text">관리자 페이지</span>
          </button>
        )}

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`mypage-menu-item ${
              activeMenu === item.id ? "active" : ""
            }`}
            title={item.name}
          >
            <span className="menu-text" style={{ position: "relative" }}>
              {item.name}
              {item.id === "message" && unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-10px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "10px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MyPageSidebar;
