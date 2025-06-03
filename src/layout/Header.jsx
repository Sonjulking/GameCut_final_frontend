// 예시: src/components/Header.jsx

import React from "react";
// 이미지 import
import logoImg from "../assets/img/main/logo/gamecut_logo.png";
import searchIcon from "../assets/img/main/icons/search_icon.png";
import loginIcon from "../assets/img/main/icons/login_icon.png";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";
import {Link} from "react-router-dom";

const Header = () => {
    return (
            <header>
                <div className="header-left">
                    <Link to={"/"}>
                        {/* import 한 변수를 src에 넣으면 정상적으로 번들링됨 */}
                        <img
                                src={logoImg}
                                alt="Gamecut Logo"
                                id="gamecut_logo"
                        />
                    </Link>
                </div>
                <div className="header-right">
                    <Link to={"/search"}>
                        <img
                                src={searchIcon}
                                className="header_icon"
                                alt="검색"
                        />
                    </Link>
                    <Link to={"login"}>
                        <img
                                src={loginIcon}
                                className="header_icon"
                                alt="로그인"
                        />
                    </Link>
                    {/* 모바일용 햄버거 토글 버튼 */}
                    <button id="sidebarToggle" className="header_icon">
                        <img
                                src={hamburgerIcon}
                                alt="메뉴"
                                style={{width: "100%", height: "100%"}}
                        />
                    </button>
                </div>
            </header>
    );
};

export default Header;
