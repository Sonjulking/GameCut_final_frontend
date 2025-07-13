import React, { useState } from "react";
import axiosInstance from "../lib/axiosInstance";

const FindPassword = () => {
  const [mode, setMode] = useState("email"); // 'email' 또는 'phone'
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "email") {
      try {
        const response = await axiosInstance.post(
          "/api/user/findPassword",
          {
            userId: formData.userId,
            email: formData.email,
          }
        );

        if (response.data.success) {
          setMessage("임시 비밀번호가 이메일로 전송되었습니다.");
        } else {
          setMessage("입력하신 정보가 일치하지 않습니다.");
        }
      } catch (err) {
        console.error(err);
        setMessage("서버 오류가 발생했습니다.");
      }
    } else {
      alert("📱 기능 구현 중입니다...");
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "email" ? "phone" : "email"));
    setFormData((prev) => ({
      ...prev,
      email: "",
      phone: "",
    }));
    setMessage("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 우측 상단에 버튼 */}
        <button type="button" onClick={toggleMode} style={styles.toggleButton}>
          {mode === "email" ? "📱 문자로 찾기" : "✉️ 이메일로 찾기"}
        </button>

        <h2 style={styles.title}>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={formData.userId}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {mode === "email" ? (
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          ) : (
            <input
              type="text"
              name="phone"
              placeholder="전화번호 (예: 010-1234-5678)"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "확인 중..." : "임시비밀번호 발송"}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 120px)", // 헤더/푸터 공간 제외
    background: "#141414",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start", // 상단 정렬
    paddingTop: "10vh", // 상단에서 10% 지점에 배치
    paddingBottom: "20px",
    boxSizing: "border-box",
  },
  card: {
    background: "#1e1e1e",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    width: "400px",
    textAlign: "center",
    position: "relative",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#ffffff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #555",
    borderRadius: "5px",
    backgroundColor: "#2c2c2c",
    color: "#ffffff",
  },
  button: {
    padding: "12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  toggleButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    fontSize: "11px",
    padding: "5px 8px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    color: "#cccccc",
  },
};

export default FindPassword;
