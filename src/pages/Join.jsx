import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const [formData, setFormData] = useState({
    userId: "",
    userPwd: "",
    userName: "",
    userNickname: "",
    phone: "",
    email: "",
  });

  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
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

  const checkUserId = async () => {
    if (!formData.userId) {
      setIdCheckMessage("아이디를 입력하세요.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/user/checkUserId?userId=${formData.userId}`
      );
      if (response.data.exists) {
        setIdCheckMessage("이미 사용중인 아이디입니다.");
      } else {
        setIdCheckMessage("사용 가능한 아이디입니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkUserNickname = async () => {
    if (!formData.userNickname) {
      setNicknameCheckMessage("닉네임을 입력하세요.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/user/checkUserNickname?userNickname=${formData.userNickname}`
      );
      if (response.data.exists) {
        setNicknameCheckMessage("이미 사용중인 닉네임입니다.");
      } else {
        setNicknameCheckMessage("사용 가능한 닉네임입니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/user/join",
        formData
      );
      if (response.data.success) {
        alert("회원가입 성공!");
        navigate("/login");
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
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="userId"
              placeholder="아이디"
              value={formData.userId}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <button
              type="button"
              style={styles.smallButton}
              onClick={checkUserId}
            >
              중복확인
            </button>
          </div>
          <p
            style={{
              color: idCheckMessage.includes("가능") ? "green" : "red",
              marginBottom: "10px",
            }}
          >
            {idCheckMessage}
          </p>

          <input
            type="password"
            name="userPwd"
            placeholder="비밀번호"
            value={formData.userPwd}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="text"
            name="userName"
            placeholder="이름"
            value={formData.userName}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="userNickname"
              placeholder="닉네임"
              value={formData.userNickname}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <button
              type="button"
              style={styles.smallButton}
              onClick={checkUserNickname}
            >
              중복확인
            </button>
          </div>
          <p
            style={{
              color: nicknameCheckMessage.includes("가능") ? "green" : "red",
              marginBottom: "10px",
            }}
          >
            {nicknameCheckMessage}
          </p>

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

// 기존 스타일 + 버튼 스타일 추가
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
    width: "400px",
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
    marginBottom: "10px",
    border: "1px solid #333",
    borderRadius: "5px",
    backgroundColor: "#2c2c2c",
    color: "#ffffff",
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    marginBottom: "10px",
  },
  smallButton: {
    padding: "10px",
    marginLeft: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    whiteSpace: "nowrap",
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
    color: "#ff4d4f",
    marginTop: "10px",
  },
};

export default Join;
