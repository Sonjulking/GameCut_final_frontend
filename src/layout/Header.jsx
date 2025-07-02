import React from "react";
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

  const handleLogout = async () => {
    try {
      await axios.post("/user/logout");
    } catch (error) {
      console.error("서버 로그아웃 실패:", error);
    } finally {
      Cookies.remove("accessToken");
      dispatch(logout());
      alert("로그아웃 성공!");
      navigate("/");
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
        <Link to={"/search"}>
          <img src={searchIcon} className="header_icon" alt="검색" />
        </Link>

        {isLoggedIn ? (
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault(); // 기본 이동 방지
              handleLogout(); // 로그아웃 로직 실행
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
