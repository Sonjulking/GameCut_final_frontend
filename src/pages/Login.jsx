import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

const NAVER_CLIENT_ID = "CQbPXwMaS8p6gHpnTpsS";
const REDIRECT_URI = "http://localhost:5173/naver/callback";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }
    if (!pwd.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8081/user/login", {
        userId,
        pwd,
      });
      if (response.data.success) {
        const { token, userNinkname, userId } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("nickname", userNinkname);
        localStorage.setItem("userId", userId);
        alert(`${userNinkname}님 환영합니다!`);
        navigate("/");
      } else {
        setError("아이디 또는 비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(
          "http://localhost:8081/user/oauth/google",
          {
            token: tokenResponse.access_token,
          }
        );
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("nickname", res.data.userNickname);
          localStorage.setItem("userId", res.data.userId);
          alert(`${res.data.userNickname}님 환영합니다!`);
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        setError("구글 로그인 실패");
      }
    },
    onError: () => {
      setError("구글 로그인 실패");
    },
  });

  const naverLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${state}`;
    window.location.href = url;
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
          {error && <p style={styles.error}>{error}</p>}
        </form>

        <div style={styles.socialWrapper}>
          <button onClick={() => googleLogin()} style={styles.googleButton}>
            Google 계정으로 로그인
          </button>

          <button onClick={naverLogin} style={styles.naverButton}>
            네이버 로그인
          </button>
        </div>

        <div style={styles.bottomWrapper}>
          <button onClick={() => navigate("/join")} style={styles.linkButton}>
            회원가입
          </button>
          <button
            onClick={() => navigate("/findPassword")}
            style={styles.linkButton}
          >
            비밀번호 찾기
          </button>
        </div>
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
  title: { marginBottom: "20px", fontSize: "24px", color: "#ffffff" },
  form: { display: "flex", flexDirection: "column" },
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
    backgroundColor: "#FF8C00", // 🎯 새로운 오렌지색 계열로 변경
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "0px", // 간격 맞추기 위해 margin 제거
    width: "100%",
  },
  error: { color: "#ff4d4f", marginTop: "10px" },
  socialWrapper: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px", // 모든 소셜 버튼 간격 일정하게
  },
  googleButton: {
    padding: "12px",
    backgroundColor: "#4285F4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  },
  naverButton: {
    padding: "12px",
    backgroundColor: "#03C75A",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  },
  bottomWrapper: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
  },
};

export default Login;
