import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/myPage.css";

// 사이드바 컴포넌트
const MySidebar = ({ activeMenu }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "info", name: "내 정보", path: "/mypage" },
    { id: "message", name: "내 쪽지", path: "/mypage/message" },
    { id: "board", name: "내 게시글", path: "/mypage/board" },
    { id: "comment", name: "내 댓글", path: "/mypage/comment" },
    { id: "video", name: "내 영상", path: "/mypage/video" },
    { id: "item", name: "내 아이템", path: "/mypage/item" },
    { id: "point", name: "내 포인트 내역", path: "/mypage/point" },
    { id: "follow", name: "팔로우", path: "/mypage/follow" },
    { id: "gtr", name: "게스더랭크 기록", path: "/mypage/gtr" },
    { id: "report", name: "신고 기록", path: "/mypage/report" },
  ];

  return (
    <div className="mypage-sidebar">
      <h2 className="mypage-title">마이페이지</h2>
      <nav className="mypage-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`mypage-menu-item ${
              activeMenu === item.id ? "active" : ""
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

// 메인 마이페이지 컴포넌트
const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 현재 활성 메뉴 결정
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === "/mypage") return "info";
    if (path.includes("/message")) return "message";
    if (path.includes("/board")) return "board";
    if (path.includes("/comment")) return "comment";
    if (path.includes("/video")) return "video";
    if (path.includes("/item")) return "item";
    if (path.includes("/point")) return "point";
    if (path.includes("/follow")) return "follow";
    if (path.includes("/gtr")) return "gtr";
    if (path.includes("/report")) return "report";
    return "info";
  };

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/1`
        // ,{
        //   withCredentials: true, // 세션 쿠키 포함
        // } // 세션없으니 일단 잠궈놔
      );
      setUser(response.data);
      console.log(user);
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 탈퇴 확인
  const confirmDelete = () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      handleDeleteUser();
    }
  };
  // 회원 탈퇴 처리
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/user/delete`, {
        withCredentials: true,
      });
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mypage-container">
        <div className="error-message">
          <h2>사용자 정보를 찾을 수 없습니다</h2>
          <button onClick={() => navigate("/")} className="back-btn">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          {/* 사이드바 */}
          <MySidebar activeMenu={getActiveMenu()} />

          {/* 메인 내용 영역 */}
          <div className="mypage-user-section">
            <h2 className="mypage-section-title">내 정보</h2>

            <div className="mypage-profile">
              {/* 프로필 이미지 */}
              <div className="mypage-img-container">
                <img
                  className="mypage-user-image"
                  alt="프로필 이미지"
                  src={
                    user.photoNo && user.photoNo !== 0 && user.profileImage
                      ? `${import.meta.env.VITE_API_URL}${user.profileImage}`
                      : "/src/assets/img/main/icons/profile_icon.png"
                  }
                />
              </div>

              {/* 사용자 정보 */}
              <div className="mypage-user-details">
                {user.role === "role_admin" && (
                  <img
                    alt="관리자이모티콘"
                    src="/src/assets/img/main/icons/admin.jpg"
                    className="admin-icon"
                  />
                )}
                <p className="mypage-user-id">{user.userId}</p>
                <p className="mypage-user-nickname">{user.userNickname}</p>
                <p className="mypage-user-point">
                  포인트: <span>{user.userPoint?.toLocaleString()}</span>P
                </p>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="mypage-actions">
              <button
                onClick={() => navigate("/mypage/update")}
                className="mypage-action-btn"
              >
                내 정보 수정
              </button>
              <button
                onClick={() => navigate("/mypage/change-password")}
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
      </div>
    </div>
  );
};

export default MyPage;
