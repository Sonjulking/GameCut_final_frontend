// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import homeIcon from "../assets/img/main/icons/home_icon.png";
import homeCaption from "../assets/img/main/captions/home_caption.png";

import boardViewIcon from "../assets/img/main/icons/board_view_icon.png";
import boardCaption from "../assets/img/main/captions/board_view_caption.png";

import profileIcon from "../assets/img/main/icons/profile_icon.png";
import profileCaption from "../assets/img/main/captions/profile_caption.png";

import friendManagementIcon from "../assets/img/main/icons/friend_management_icon.png";
import friendManagementCaption from "../assets/img/main/captions/friend_management_caption.png";

import webGameIcon from "../assets/img/main/icons/web_game_icon.png";
import webGameCaption from "../assets/img/main/captions/web_game_caption.png";

import seasonRankingIcon from "../assets/img/main/icons/season_ranking_icon.png";
import seasonRankingCaption from "../assets/img/main/captions/season_ranking_caption.png";

import settingIcon from "../assets/img/main/icons/setting_icon.png";
import settingCaption from "../assets/img/main/captions/setting_caption.png";

import shoppingIcon from "../assets/img/main/icons/shopping_icon.png";
import shoppingCaption from "../assets/img/main/captions/shopping_caption.png";

import "../styles/sidebar.css"; // ✅ CSS 분리

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const toggleBtn = document.querySelector("#sidebarToggle");
    const sidebarEl = document.querySelector(".sidebar");

    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };

    if (toggleBtn) {
      toggleBtn.addEventListener("click", handleToggle);
    }

    const handleOutsideClick = (e) => {
      if (
        sidebarEl &&
        !sidebarEl.contains(e.target) &&
        toggleBtn &&
        !toggleBtn.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      if (toggleBtn) {
        toggleBtn.removeEventListener("click", handleToggle);
      }
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleProtectedRoute = (path) => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <Link to="/" className="sidebar_item">
        <div className="icon-wrapper">
          <img src={homeIcon} className="sidebar_icons" alt="홈" />
          <img src={homeCaption} className="caption_image" alt="홈 캡션" />
        </div>
        <span className="sidebar_label">홈</span>
      </Link>

      <Link to="/board/list" className="sidebar_item">
        <div className="icon-wrapper">
          <img src={boardViewIcon} className="sidebar_icons" alt="게시판" />
          <img src={boardCaption} className="caption_image" alt="게시판 캡션" />
        </div>
        <span className="sidebar_label">게시판</span>
      </Link>

      <div
        className="sidebar_item"
        onClick={() => handleProtectedRoute("/myPage")}
      >
        <div className="icon-wrapper">
          <img src={profileIcon} className="sidebar_icons" alt="프로필" />
          <img
            src={profileCaption}
            className="caption_image"
            alt="프로필 캡션"
          />
        </div>
        <span className="sidebar_label">프로필</span>
      </div>

      <div
        className="sidebar_item"
        onClick={() => handleProtectedRoute("shopping")}
      >
        <div className="icon-wrapper">
          <img src={shoppingIcon} className="sidebar_icons" alt="쇼핑 하기" />
          <img
            src={shoppingCaption}
            className="caption_image"
            alt="쇼핑 캡션"
          />
        </div>
        <span className="sidebar_label">쇼핑 하기</span>
      </div>

      <Link to="/webGame" className="sidebar_item">
        <div className="icon-wrapper">
          <img src={webGameIcon} className="sidebar_icons" alt="웹 게임" />
          <img
            src={webGameCaption}
            className="caption_image"
            alt="웹 게임 캡션"
          />
        </div>
        <span className="sidebar_label">웹 게임</span>
      </Link>

      <Link to="/rankings" className="sidebar_item">
        <div className="icon-wrapper">
          <img
            src={seasonRankingIcon}
            className="sidebar_icons"
            alt="시즌 랭킹"
          />
          <img
            src={seasonRankingCaption}
            className="caption_image"
            alt="시즌 랭킹 캡션"
          />
        </div>
        <span className="sidebar_label">시즌 랭킹</span>
      </Link>

      <Link to="/settings" className="sidebar_item">
        <div className="icon-wrapper">
          <img src={settingIcon} className="sidebar_icons" alt="설정" />
          <img src={settingCaption} className="caption_image" alt="설정 캡션" />
        </div>
        <span className="sidebar_label">설정</span>
      </Link>
    </div>
  );
};

export default Sidebar;
