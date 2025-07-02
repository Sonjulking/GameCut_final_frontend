// 2025-07-02 생성됨
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
  const [emailVerifyMessage, setEmailVerifyMessage] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [inputEmailCode, setInputEmailCode] = useState("");
  const [serverEmailCode, setServerEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

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
      setIdCheckMessage(
        response.data.exists
          ? "이미 사용중인 아이디입니다."
          : "사용 가능한 아이디입니다."
      );
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
      setNicknameCheckMessage(
        response.data.exists
          ? "이미 사용중인 닉네임입니다."
          : "사용 가능한 닉네임입니다."
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✨ 이메일 인증버튼 기능 (인증번호 받기)
  const sendEmailCode = async () => {
    if (!formData.email) {
      setEmailVerifyMessage("이메일을 입력하세요.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8081/user/email/send`,
        { email: formData.email }
      );
      if (response.data.success) {
        setEmailVerifyMessage("인증번호가 전송되었습니다.");
        setEmailCodeSent(true);
        setServerEmailCode(response.data.code); // 백엔드에서 받은 인증코드 저장
      } else {
        setEmailVerifyMessage("이메일 전송 실패.");
      }
    } catch (err) {
      console.error(err);
      setEmailVerifyMessage("서버 오류 발생.");
    }
  };

  // ✨ 인증번호 확인
  const checkEmailCode = () => {
    if (inputEmailCode === serverEmailCode) {
      setEmailVerifyMessage("이메일 인증 성공!");
      setEmailVerified(true);
    } else {
      setEmailVerifyMessage("인증번호가 일치하지 않습니다.");
    }
  };

  const validateForm = () => {
    if (
      !formData.userId ||
      !formData.userPwd ||
      !formData.userName ||
      !formData.userNickname ||
      !formData.email
    ) {
      setError("필수 입력값을 모두 작성해주세요.");
      return false;
    }
    if (idCheckMessage === "이미 사용중인 아이디입니다.") {
      setError("아이디 중복 확인을 다시 해주세요.");
      return false;
    }
    if (nicknameCheckMessage === "이미 사용중인 닉네임입니다.") {
      setError("닉네임 중복 확인을 다시 해주세요.");
      return false;
    }
    if (!emailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!validateForm()) return;

    setLoading(true);
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
              disabled={loading}
            >
              중복확인
            </button>
          </div>
          <p
            style={{ color: idCheckMessage.includes("가능") ? "green" : "red" }}
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
              disabled={loading}
            >
              중복확인
            </button>
          </div>
          <p
            style={{
              color: nicknameCheckMessage.includes("가능") ? "green" : "red",
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

          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <button
              type="button"
              style={styles.smallButton}
              onClick={sendEmailCode}
              disabled={loading}
            >
              인증번호발송
            </button>
          </div>

          {emailCodeSent && (
            <>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="인증번호 입력"
                  value={inputEmailCode}
                  onChange={(e) => setInputEmailCode(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.smallButton}
                  onClick={checkEmailCode}
                >
                  확인
                </button>
              </div>
            </>
          )}

          <p
            style={{
              color: emailVerifyMessage.includes("성공") ? "green" : "red",
            }}
          >
            {emailVerifyMessage}
          </p>

          <button type="submit" style={styles.submitButton} disabled={loading}>
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
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    width: "420px",
    textAlign: "center",
  },
  title: { marginBottom: "20px", fontSize: "26px", color: "#ffffff" },
  form: { display: "flex", flexDirection: "column" },
  input: {
    padding: "12px",
    border: "1px solid #333",
    borderRadius: "5px",
    backgroundColor: "#2c2c2c",
    color: "#ffffff",
    flex: 1,
  },
  inputGroup: { display: "flex", gap: "10px", marginBottom: "10px" },
  smallButton: {
    padding: "12px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  submitButton: {
    padding: "14px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },
  error: { color: "#ff4d4f", marginTop: "10px" },
};

export default Join;
