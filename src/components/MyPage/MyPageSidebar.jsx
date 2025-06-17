import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/myPageSidebar.css";

const MyPageSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "info",
      name: "내 정보",
      path: "/myPage",
      icon: "👤",
    },
    {
      id: "message",
      name: "내 쪽지",
      path: "/mypage/message",
      icon: "💌",
    },
    {
      id: "board",
      name: "내 게시글",
      path: "/myBoard",
      icon: "📝",
    },
    {
      id: "comment",
      name: "내 댓글",
      path: "/mypage/comment",
      icon: "💬",
    },
    {
      id: "video",
      name: "내 영상",
      path: "/mypage/video",
      icon: "🎥",
    },
    {
      id: "item",
      name: "내 아이템",
      path: "/mypage/item",
      icon: "🎁",
    },
    {
      id: "point",
      name: "내 포인트 내역",
      path: "/mypage/point",
      icon: "💰",
    },
    {
      id: "follow",
      name: "팔로우",
      path: "/mypage/follow",
      icon: "👥",
    },
    {
      id: "gtr",
      name: "게스더랭크 기록",
      path: "/mypage/gtr",
      icon: "🏆",
    },
    {
      id: "report",
      name: "신고 기록",
      path: "/mypage/report",
      icon: "🚨",
    },
  ];

  // 현재 활성 메뉴 결정
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === "/myPage") return "info";
    if (path.includes("/message")) return "message";
    if (path.includes("/myBoard")) return "board";
    if (path.includes("/comment")) return "comment";
    if (path.includes("/video")) return "video";
    if (path.includes("/item")) return "item";
    if (path.includes("/point")) return "point";
    if (path.includes("/follow")) return "follow";
    if (path.includes("/gtr")) return "gtr";
    if (path.includes("/report")) return "report";
    return "info";
  };

  const activeMenu = getActiveMenu();

  return (
    <div className="mypage-sidebar">
      <h2 className="mypage-title">마이페이지</h2>
      <nav className="mypage-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`mypage-menu-item ${
              activeMenu === item.id ? "active" : ""
            }`}
            title={item.name}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MyPageSidebar;
