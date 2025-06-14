// src/components/Sidebar.jsx
import React, {useEffect, useState} from "react";

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
                <Link to={"/"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img src={homeIcon} className="sidebar_icons" alt="홈"/>
                        <img src={homeCaption} className="caption_image" alt="홈 캡션"/>
                    </div>
                    <span className="sidebar_label">홈</span>
                </Link>
                <Link to={"/test"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={boardViewIcon}
                                className="sidebar_icons"
                                alt="게시판"
                        />
                        <img src={boardCaption} className="caption_image" alt="게시판 캡션"/>
                    </div>
                    <span className="sidebar_label">게시판</span>

                </Link>
                <Link to={"/profile"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={profileIcon}
                                className="sidebar_icons"
                                alt="프로필"
                        />
                        <img src={profileCaption} className="caption_image" alt="프로필 캡션"/>
                    </div>
                    <span className="sidebar_label">프로필</span>
                </Link>
                <Link to={"/friendManagement"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={friendManagementIcon}
                                className="sidebar_icons"
                                alt="친구 관리"
                        />
                        <img
                                src={friendManagementCaption} className="caption_image"
                                alt="친구 관리 캡션"
                        />
                    </div>
                    <span className="sidebar_label">친구관리</span>
                </Link>
                <Link to={"/webGame"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={webGameIcon}
                                className="sidebar_icons"
                                alt="웹 게임"
                        />
                        <img
                                src={webGameCaption} className="caption_image"
                                alt="웹 게임 캡션"
                        />
                    </div>
                    <span className="sidebar_label">웹 게임</span>
                </Link>
                <Link to={"/rankings"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={seasonRankingIcon}
                                className="sidebar_icons"
                                alt="시즌 랭킹"
                        />
                        <img
                                src={seasonRankingCaption} className="caption_image"
                                alt="시즌 랭킹 캡션"
                        />
                    </div>
                    <span className="sidebar_label">시즌 랭킹</span>
                </Link>
                <Link to={"/settings"} className="sidebar_item">
                    <div className="icon-wrapper">
                        <img
                                src={settingIcon}
                                className="sidebar_icons"
                                alt="설정"
                        />
                        <img
                                src={settingCaption} className="caption_image"
                                alt="설정 캡션"
                        />
                    </div>
                    <span className="sidebar_label">설정</span>
                </Link>
            </div>
    );
};

export default Sidebar;
