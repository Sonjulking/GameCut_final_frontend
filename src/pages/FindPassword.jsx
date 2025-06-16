import React, { useState } from "react";
import axios from "axios";

const FindPassword = () => {
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
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

    try {
      const response = await axios.post(
        "http://localhost:8081/user/findPassword",
        formData
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

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "확인 중..." : "비밀번호 찾기"}
          </button>
          {message && <p style={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "#141414", // 다크 배경
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#1e1e1e", // 카드 다크 그레이
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    width: "400px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#ffffff", // 흰색 타이틀
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #555", // 어두운 테두리
    borderRadius: "5px",
    backgroundColor: "#2c2c2c", // 입력창 다크
    color: "#ffffff", // 입력 텍스트 흰색
  },
  button: {
    padding: "12px",
    backgroundColor: "#28a745", // 초록색 유지
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "15px",
    color: "#cccccc", // 메세지 흰색 계열
  },
};

export default FindPassword;
