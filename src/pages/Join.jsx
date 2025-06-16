import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    user_pwd: "",
    user_name: "",
    user_nickname: "",
    phone: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/join", formData);
      if (response.data.success) {
        alert("회원가입 성공!");
        navigate("/login"); // 회원가입 성공 후 로그인 화면으로 이동
      } else {
        setError("회원가입에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 오류가 발생했습니다.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>회원가입</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="user_id"
            placeholder="아이디"
            value={formData.user_id}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="user_pwd"
            placeholder="비밀번호"
            value={formData.user_pwd}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="user_name"
            placeholder="이름"
            value={formData.user_name}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="user_nickname"
            placeholder="닉네임"
            value={formData.user_nickname}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
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
            {loading ? "가입 중..." : "회원가입"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "#141414",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#1e1e1e", // 카드 어두운 회색
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
    border: "1px solid #333",
    borderRadius: "5px",
    backgroundColor: "#2c2c2c", // 어두운 입력창
    color: "#ffffff", // 입력 텍스트 흰색
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    color: "#ff4d4f", // 좀 더 눈에 띄는 레드
    marginTop: "10px",
  },
};

export default Join;
