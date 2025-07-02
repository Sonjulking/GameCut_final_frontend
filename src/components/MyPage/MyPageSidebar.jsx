import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ 추가
import "../../styles/MyPageSidebar.css";

const MyPageSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user); // ✅ Redux에서 유저 정보 가져오기

  const menuItems = [
    { id: "info", name: "내 정보", path: "/mypage/info" },
    { id: "message", name: "내 쪽지", path: "/mypage/message" },
    { id: "board", name: "내 게시글", path: "/mypage/board" },
    { id: "comment", name: "내 댓글", path: "/mypage/comment" },
    { id: "video", name: "내 영상", path: "/mypage/video" },
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
    return "info";
  };

  const activeMenu = getActiveMenu();

  return (
    <div className="mypage-sidebar">
      <h2 className="mypage-title">마이페이지</h2>

      <nav className="mypage-menu">
        {/* ✅ 관리자 전용 메뉴 표시 */}
        {user?.role === "ROLE_ADMIN" && (
          <button
            onClick={() => navigate("/admin")}
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
            <span className="menu-text">{item.name}</span>
            {activeMenu === item.id && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#58a6ff",
                  marginLeft: "auto",
                }}
              ></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MyPageSidebar;
