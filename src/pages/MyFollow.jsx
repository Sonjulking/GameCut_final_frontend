import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import UserProfilePopup from "./UserProfilePopup";
import "../styles/myFollow.css";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import { useSelector } from "react-redux";

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyFollow = () => {
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [isFollowingTab, setIsFollowingTab] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
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

  // 2025-07-15 수정됨 - 사이드바 토글 기능 추가
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 2025-07-15 수정됨 - 모바일에서 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  const handleUnfollow = async (userNo) => {
    try {
      await axiosInstance.post("/api/follow", { toUserNo: userNo });
      loadFollowData(); // 갱신
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
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            {/* 2025-07-15 수정됨 - 사용자 섹션 내부에 햄버거 버튼 추가 */}
            <button
              className="mypage-mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title">
                  {isFollowingTab ? "내가 팔로우한 사람" : "나를 팔로우한 사람"}
                </h2>
                <div className="message-tab-buttons">
                  <button
                    className={!isFollowingTab ? "active" : ""}
                    onClick={() => setIsFollowingTab(false)}
                  >
                    팔로워
                  </button>
                  <button
                    className={isFollowingTab ? "active" : ""}
                    onClick={() => setIsFollowingTab(true)}
                  >
                    팔로잉
                  </button>
                </div>
              </div>

              {list.length === 0 ? (
                <p style={{ color: "#ccc" }}>아직 표시할 사람이 없습니다.</p>
              ) : (
                <table className="board-table">
                  <thead>
                    <tr>
                      <th>닉네임</th>
                      <th>ID</th>
                      <th>프로필</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((user) => (
                      <tr key={user.userNo}>
                        <td
                          style={{ cursor: "pointer", color: "#4da3ff" }}
                          onClick={() => handleProfileOpen(user)}
                        >
                          {user.userNickname}
                        </td>
                        <td>{user.userId}</td>
                        <td>
                          {user.photo?.fileUrl ? (
                            <img
                              src={
                                import.meta.env.VITE_API_URL +
                                user.photo.fileUrl
                              }
                              alt="profile"
                              width={40}
                              height={40}
                              style={{ borderRadius: "50%" }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 프로필 팝업 */}
              <UserProfilePopup
                open={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                user={selectedUser}
              />
            </div>
          </div>

          {/* 2025-07-15 수정됨 - 모바일 오버레이 추가 */}
          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          {/* 2025-07-15 수정됨 - 사이드바에 상태 props 전달 */}
          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>
    </div>
  );
};

export default MyFollow;
