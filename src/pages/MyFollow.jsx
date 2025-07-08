import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import UserProfilePopup from "./UserProfilePopup";
import "../styles/myFollow.css";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import { useSelector } from "react-redux";

const MyFollow = () => {
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [isFollowingTab, setIsFollowingTab] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        axiosInstance.get("/follow/followers"),
        axiosInstance.get("/follow/following"),
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

  const handleUnfollow = async (userNo) => {
    try {
      await axiosInstance.post("/follow", { toUserNo: userNo });
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
                      <th>동작</th>
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
                        <td>
                          {isFollowingTab && (
                            <button
                              className="delete-button"
                              onClick={() => handleUnfollow(user.userNo)}
                            >
                              팔로우 해제
                            </button>
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
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyFollow;
