// src/components/Sidebar.jsx
import React, {useEffect, useState} from "react";

// 아이콘 파일을 import 합니다.
import homeIcon from "../assets/img/main/icons/home_icon.png";
import boardViewIcon from "../assets/img/main/icons/board_view_icon.png";
import profileIcon from "../assets/img/main/icons/profile_icon.png";
import friendManagementIcon from "../assets/img/main/icons/friend_management_icon.png";
import webGameIcon from "../assets/img/main/icons/web_game_icon.png";
import seasonRankingIcon from "../assets/img/main/icons/season_ranking_icon.png";
import settingIcon from "../assets/img/main/icons/setting_icon.png";
import {Link} from "react-router-dom";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const toggleBtn = document.getElementById("sidebarToggle");
        const sidebarEl = document.querySelector(".sidebar");

        const handleToggle = () => {
            setIsOpen((prev) => !prev);
        };

        if (toggleBtn) {
            toggleBtn.addEventListener("click", handleToggle);
        }

        // 사이드바 외부 클릭 시 닫기
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

    return (
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                {/*TODO Link로 바꾸기*/}
                <Link to={"/test"}>
                    <img src={homeIcon} className="sidebar_icons" alt="홈"/>
                    <span className="sidebar_label">홈</span>
                </Link>
                <a href="selectAllBoards.do">
                    <img
                            src={boardViewIcon}
                            className="sidebar_icons"
                            alt="게시판"
                    />
                    <span className="sidebar_label">게시판</span>
                </a>
                <a href="myPage.do">
                    <img
                            src={profileIcon}
                            className="sidebar_icons"
                            alt="마이페이지"
                    />
                    <span className="sidebar_label">마이페이지</span>
                </a>
                <a href="#">
                    <img
                            src={friendManagementIcon}
                            className="sidebar_icons"
                            alt="친구 관리"
                    />
                    <span className="sidebar_label">친구 관리</span>
                </a>
                <a href="#">
                    <img
                            src={webGameIcon}
                            className="sidebar_icons"
                            alt="웹 게임"
                    />
                    <span className="sidebar_label">웹 게임</span>
                </a>
                <a href="#">
                    <img
                            src={seasonRankingIcon}
                            className="sidebar_icons"
                            alt="시즌 랭킹"
                    />
                    <span className="sidebar_label">시즌 랭킹</span>
                </a>
                <a href="#">
                    <img
                            src={settingIcon}
                            className="sidebar_icons"
                            alt="설정"
                    />
                    <span className="sidebar_label">설정</span>
                </a>
            </div>
    );
};

export default Sidebar;
