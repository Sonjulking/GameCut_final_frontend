// MyFollow.jsx - 2025년 7월 16일 수정됨
import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import UserProfilePopup from "./UserProfilePopup";
import "../styles/myFollow.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyFollow = () => {
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [isFollowingTab, setIsFollowingTab] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const loadFollowData = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        axiosInstance.get("/api/follow/followers"),
        axiosInstance.get("/api/follow/following"),
      ]);
      setFollowerList(followersRes.data);
      setFollowingList(followingRes.data);
    } catch (err) {
      console.error("팔로우 데이터 조회 실패", err);
    }
  };

  useEffect(() => {
    loadFollowData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  const handleUnfollow = async (userNo) => {
    try {
      await axiosInstance.post("/api/follow", { toUserNo: userNo });
      loadFollowData();
    } catch (err) {
      console.error("팔로우 해제 실패", err);
    }
  };

  const handleProfileOpen = (user) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const list = isFollowingTab ? followingList : followerList;

  return (
    <div className="mypage-container">
      <div className="content-wrapper">
        <div className="mypage-user-section">
          <button
            className="mypage-mobile-menu-toggle"
            onClick={toggleSidebar}
            aria-label="마이페이지 메뉴 토글"
          >
            <img src={hamburgerIcon} alt="마이페이지 메뉴" />
          </button>

          <div className="follow-container">
            <div className="follow-header">
              <h2 className="follow-section-title">
                {isFollowingTab ? "내가 팔로우한 사람" : "나를 팔로우한 사람"}
              </h2>
              <br />
              <br />
              <div className="follow-tabs">
                <button
                  className={!isFollowingTab ? "active" : ""}
                  onClick={() => setIsFollowingTab(false)}
                >
                  팔로워 ({followerList.length})
                </button>
                <button
                  className={isFollowingTab ? "active" : ""}
                  onClick={() => setIsFollowingTab(true)}
                >
                  팔로잉 ({followingList.length})
                </button>
              </div>
            </div>

            {list.length === 0 ? (
              <div className="empty-text">
                {isFollowingTab
                  ? "아직 팔로우한 사람이 없습니다."
                  : "아직 팔로워가 없습니다."}
              </div>
            ) : (
              <ul className="follow-list">
                {list.map((user) => (
                  <li key={user.userNo} className="follow-item">
                    {user.photo?.fileUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          user.photo.fileUrl
                        }`}
                        alt={`${user.userNickname} 프로필`}
                        className="follow-avatar"
                      />
                    ) : (
                      <div
                        className="follow-avatar"
                        style={{
                          backgroundColor: "#30363d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          fontSize: "12px",
                        }}
                      >
                        없음
                      </div>
                    )}
                    <span
                      className="follow-nickname"
                      onClick={() => handleProfileOpen(user)}
                      style={{ cursor: "pointer", color: "#4da3ff" }}
                    >
                      {user.userNickname}
                    </span>
                    <span
                      style={{
                        color: "#aaa",
                        fontSize: "14px",
                        marginLeft: "8px",
                      }}
                    >
                      @{user.userId}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {isSidebarOpen && (
          <div
            className="mobile-sidebar-overlay"
            onClick={handleOverlayClick}
          />
        )}

        <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      </div>

      <UserProfilePopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default MyFollow;
