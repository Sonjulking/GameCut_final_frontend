import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axiosInstance"; // ✅ axiosInstance 사용
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myBoard.css";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("변경할 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.put("/user/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (response.data.success) {
        alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        setMessage(response.data.message || "비밀번호 변경 실패");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <h2 className="mypage-section-title">비밀번호 변경</h2>

            <form className="mypage-password-form" onSubmit={handleSubmit}>
              <input
                type="password"
                name="currentPassword"
                placeholder="현재 비밀번호"
                value={form.currentPassword}
                onChange={handleChange}
                required
                className="mypage-input"
              />

              <input
                type="password"
                name="newPassword"
                placeholder="새 비밀번호"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="mypage-input"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="새 비밀번호 확인"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="mypage-input"
              />

              <button type="submit" className="mypage-action-btn">
                변경하기
              </button>
              {message && <p className="mypage-error-message">{message}</p>}
            </form>
          </div>
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
