import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MyPageSidebar from "../components/MyPage/MyPageSidebar.jsx"; // 새로운 사이드바 import
import "../styles/MyPage.css";

// 메인 마이페이지 컴포넌트
const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 시큐리티 통신을 위한 config_get
  const config_get = {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/myinfo`,
        config_get
      );
      setUser(response.data);
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/delete/${localStorage.getItem(
          "userId"
        )}`,
        config_get
      );
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    console.log("쿠키: " + document.cookie);
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
          {/* 새로운 통합 사이드바 사용 */}
          <MyPageSidebar />

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
      </div>
    </div>
  );
};

export default MyPage;
