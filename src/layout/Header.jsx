import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation 추가
import logoImg from "../assets/img/main/logo/gamecut_logo.png";
import searchIcon from "../assets/img/main/icons/search_icon.png";
import loginIcon from "../assets/img/main/icons/login_icon.png";
import logoutIcon from "../assets/img/main/icons/logout_Icon.png";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 현재 URL 경로를 추적

  // ✅ location이 바뀔 때마다 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("로그아웃 성공!");
    navigate("/");
  };

  return (
    <header>
      <div className="header-left">
        <Link to={"/"}>
          <img src={logoImg} alt="Gamecut Logo" id="gamecut_logo" />
        </Link>
      </div>
      <div className="header-right">
        <Link to={"/search"}>
          <img src={searchIcon} className="header_icon" alt="검색" />
        </Link>

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
