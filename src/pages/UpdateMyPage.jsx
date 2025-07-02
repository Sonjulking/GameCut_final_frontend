import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";

const UpdateMyPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    userNickname: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/user/myinfo")
      .then((res) => {
        setForm({
          userId: res.data.userId || "",
          userNickname: res.data.userNickname || "",
        });
      })
      .catch(() => {
        // 실패해도 빈 상태 유지
      })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .put("/user", { userId: form.userId, userNickname: form.userNickname })
      .then(() => {
        alert("정보 수정이 완료되었습니다.");
        // 수정된 정보 반영한 마이페이지 리로드
        window.location.href = "/mypage/info";
      })
      .catch((err) => {
        alert(err.response?.data?.message || "수정에 실패했습니다.");
      });
  };

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="mypage-user-section">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-user-section">
        <h2>내 정보 수정</h2>
        <form onSubmit={onSubmit}>
          <label>로그인 아이디</label>
          <input
            name="userId"
            value={form.userId}
            onChange={onChange}
            className="mypage-input"
            required
          />

          <label>닉네임</label>
          <input
            name="userNickname"
            value={form.userNickname}
            onChange={onChange}
            className="mypage-input"
            required
          />

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="mypage-action-btn">
              수정 완료
            </button>
            <button
              type="button"
              className="mypage-action-btn"
              onClick={() => navigate(-1)}
              style={{ marginLeft: "0.5rem" }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMyPage;
