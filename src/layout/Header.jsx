import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import axios from "../lib/axiosInstance";
import Cookies from "js-cookie";

import logoImg from "../assets/img/main/logo/gamecut_logo.png";
import searchIcon from "../assets/img/main/icons/search_icon.png";
import loginIcon from "../assets/img/main/icons/login_icon.png";
import logoutIcon from "../assets/img/main/icons/logout_Icon.png";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    try {
      await axios.post("/user/logout");
    } catch (e) {
      console.error("서버 로그아웃 실패:", e);
    } finally {
      Cookies.remove("accessToken");
      dispatch(logout());
      navigate("/");
    }
  };

  const handleSearchClick = () => {
    if (showSearch) {
      if (searchTerm.trim()) {
        navigate(
          // 키워드 포함된 게시물 조회
          `/board/list?page=1&keyword=${encodeURIComponent(searchTerm.trim())}`
        );
      } else {
        // 빈 채로 검색할 시 모든 게시물 조회
        navigate(`/board/list`);
      }
      setShowSearch(false);
      setSearchTerm("");
    } else {
      setShowSearch(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchTerm.trim()) {
        navigate(
          `/board/list?page=1&keyword=${encodeURIComponent(searchTerm.trim())}`
        );
      } else {
        navigate(`/board/list?page=1`);
      }
      setShowSearch(false);
      setSearchTerm("");
    }
  };

  return (
    <header>
      <div className="header-left">
        <Link to={"/"}>
          <img src={logoImg} alt="Gamecut Logo" id="gamecut_logo" />
        </Link>
      </div>

      <div className="header-right">
        {/* 검색창을 먼저 렌더링해서 아이콘 왼쪽에 위치 */}
        {showSearch && (
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요"
            autoFocus
          />
        )}
        {/* 돋보기 아이콘 */}
        <button
          onClick={handleSearchClick}
          className="header_icon"
          aria-label="검색"
        >
          <img
            src={searchIcon}
            alt="검색"
            style={{ width: "100%", height: "100%" }}
          />
        </button>
        {isLoggedIn ? (
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <img src={logoutIcon} className="header_icon" alt="로그아웃" />
          </Link>
        ) : (
          <Link to={"/login"}>
            <img src={loginIcon} className="header_icon" alt="로그인" />
          </Link>
        )}
        <button id="sidebarToggle" className="header_icon">
          <img
            src={hamburgerIcon}
            alt="메뉴"
            style={{ width: "100%", height: "100%" }}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
