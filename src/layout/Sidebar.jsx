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
        const toggleBtn = document.querySelector("#sidebarToggle");
        const sidebarEl = document.querySelector(".sidebar");

        const handleToggle = () => {
            setIsOpen((prev) => !prev);
        };

        if (toggleBtn) { //토글버튼이 존재한다면
            //버튼에 click 이벤트 등록
            toggleBtn.addEventListener("click", handleToggle);
        }

        // 사이드바 외부 클릭 시 사이드바 닫는 함수
        const handleOutsideClick = (e) => {
            //sidebarEl이 존재할때
            //!sidebarEl.contains(e.target) : 사용자가 클릭한 요소가 sidebarEl 내부에 포함되지 않는다면
            //toggleBtn이 존재할때
            //!toggleBtn.contains(e.target) : 사용자가 클릭한 요소가 toggleBtn 내부에 포함되지 않는다면
            if (
                    sidebarEl && !sidebarEl.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        // 전체 문서에 클릭 이벤트 추가 (외부 클릭 감지용)
        document.addEventListener("click", handleOutsideClick);

        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거 (메모리 누수 방지) (useEffect 문법)
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
                <Link to={"/board"}>
                    <img
                            src={boardViewIcon}
                            className="sidebar_icons"
                            alt="게시판"
                    />
                    <span className="sidebar_label">게시판</span>
                </Link>
                <Link to={"/profile"}>
                    <img
                            src={profileIcon}
                            className="sidebar_icons"
                            alt="마이페이지"
                    />
                    <span className="sidebar_label">마이페이지</span>
                </Link>
                <Link to={"/friendManagement"}>
                    <img
                            src={friendManagementIcon}
                            className="sidebar_icons"
                            alt="친구 관리"
                    />
                    <span className="sidebar_label">친구 관리</span>
                </Link>
                <Link to={"/webGame"}>
                    <img
                            src={webGameIcon}
                            className="sidebar_icons"
                            alt="웹 게임"
                    />
                    <span className="sidebar_label">웹 게임</span>
                </Link>
                <Link to={"/rankings"}>
                    <img
                            src={seasonRankingIcon}
                            className="sidebar_icons"
                            alt="시즌 랭킹"
                    />
                    <span className="sidebar_label">시즌 랭킹</span>
                </Link>
                <Link to={"/settings"}>
                    <img
                            src={settingIcon}
                            className="sidebar_icons"
                            alt="설정"
                    />
                    <span className="sidebar_label">설정</span>
                </Link>
            </div>
    );
};

export default Sidebar;
