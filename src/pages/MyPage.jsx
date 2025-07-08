import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar.jsx";
import "../styles/MyPage.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../store/userSlice";

const MyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userInfo = useSelector((state) => state.user.userInfo);

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
        <div className="error-message">
          <h2>사용자 정보를 불러오는 중...</h2>
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
          <div className="mypage-user-section">
            <h2 className="mypage-section-title">내 정보</h2>

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
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
