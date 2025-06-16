import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/login", {
        userId,
        pwd,
      });

      if (response.data.success) {
        alert("로그인 성공!");
        navigate("/index"); // 로그인 성공시 이동할 페이지
      } else {
        setError("아이디 또는 비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 오류가 발생했습니다.");
    }

    setLoading(false);
  };

  const handleFindPassword = () => {
    navigate("/FindPassword");
  };

  const handleJoin = () => {
    navigate("/Join");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>로그인</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            name="pwd"
            placeholder="비밀번호"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <button
            type="button"
            style={styles.findButton}
            onClick={handleFindPassword}
          >
            비밀번호 찾기
          </button>
          <button type="button" style={styles.joinButton} onClick={handleJoin}>
            회원가입
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
    background: "#1e1e1e",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    width: "350px",
    textAlign: "center",
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
    border: "1px solid #333",
    borderRadius: "5px",
    backgroundColor: "#2c2c2c",
    color: "#ffffff",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  findButton: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  joinButton: {
    padding: "10px",
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    color: "#ff4d4f",
    marginTop: "10px",
  },
};

export default Login;
