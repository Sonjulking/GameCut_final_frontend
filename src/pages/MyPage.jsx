import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axiosInstance"; // ✅ axiosInstance 사용
import MyPageSidebar from "../components/MyPage/MyPageSidebar.jsx";
import "../styles/MyPage.css";
import { useSelector } from "react-redux";
import Cookie from "js-cookie";

const MyPage = () => {
  const navigate = useNavigate();
  //전역변수 추가된부분
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
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

  // if (user) {
  //   return (
  //     <div className="mypage-container">
  //       <div className="loading-spinner">
  //         <div className="spinner"></div>
  //         <p>사용자 정보를 불러오는 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
          <MyPageSidebar />

          <div className="mypage-user-section">
            <h2 className="mypage-section-title">내 정보</h2>

            <div className="mypage-profile">
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
