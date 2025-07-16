import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar.jsx";
import "../styles/myPage.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../store/userSlice";

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userInfo = useSelector((state) => state.user.userInfo);

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 최신 유저 정보 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUser());
    }
  }, [dispatch, isLoggedIn]);

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

  const confirmDelete = () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      handleDeleteUser();
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.put(`/user/delete`);
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  if (!userInfo) {
    return (
      <div className="mypage-container">
        <div className="mypage-content">
          <div className="content-wrapper">
            <div className="mypage-user-section">
              <div className="loading-container">
                <p className="loading-text">사용자 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            
            {/* 2025-07-15 수정됨 - 헤더 스타일 통일 */}
            <div className="mypage-header">
              <h2 className="mypage-title-header">
                👤 내 정보
              </h2>
            </div>

            <div className="mypage-content-area">
              <div className="mypage-profile">
                <div className="mypage-img-container">
                  <img
                    className="mypage-user-image"
                    alt="프로필 이미지"
                    src={
                      userInfo?.photo?.photoNo &&
                      userInfo.photo.photoNo !== 0 &&
                      userInfo.photo?.attachFile?.fileUrl
                        ? `${import.meta.env.VITE_API_URL}${
                            userInfo.photo.attachFile.fileUrl
                          }`
                        : "/src/assets/img/main/icons/profile_icon.png"
                    }
                  />
                </div>

                <div className="mypage-user-details">
                  {userInfo.role === "role_admin" && (
                    <img
                      alt="관리자이모티콘"
                      src="/src/assets/img/main/icons/admin.jpg"
                      className="admin-icon"
                    />
                  )}
                  <p className="mypage-user-id">{userInfo.userId}</p>
                  <p className="mypage-user-nickname">{userInfo.userNickname}</p>
                  <p className="mypage-user-point">
                    포인트: <span>{userInfo.userPoint?.toLocaleString()}</span>P
                  </p>
                </div>
              </div>

              <div className="mypage-actions">
                <button
                  onClick={() => navigate("/mypage/update")}
                  className="mypage-action-btn"
                >
                  내 정보 수정
                </button>
                <button
                  onClick={() => navigate("/mypage/changePassword")}
                  className="mypage-action-btn"
                >
                  비밀번호 변경
                </button>
                <button
                  onClick={confirmDelete}
                  className="mypage-action-btn mypage-danger"
                >
                  탈퇴하기
                </button>
              </div>
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

export default MyPage;