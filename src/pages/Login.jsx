import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axiosInstance"; // ✅ 변경된 경로에 맞게 수정
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";

const NAVER_CLIENT_ID = "CQbPXwMaS8p6gHpnTpsS";
const REDIRECT_URI = "http://localhost:5173/naver/callback";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim()) return setError("아이디를 입력해주세요.");
    if (!pwd.trim()) return setError("비밀번호를 입력해주세요.");

    setLoading(true);
    try {
      const response = await axios.post("/user/login", { userId, pwd });

      if (response.data.success) {
        const { token, userNickname, userId, userNo } = response.data;
        localStorage.setItem("token", token);

        localStorage.setItem("nickname", userNickname);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userNo", userNo);
        dispatch(
          loginSuccess({
            token,
            userId: userId,
            nickname: userNickname,
          })
        );

        alert(`${userNickname}님 환영합니다!`);
        navigate("/");
      } else {
        // 🔥 백엔드에서 보내준 메시지를 그대로 출력
        setError(response.data.message || "아이디 또는 비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      const accessToken = response.access_token;
      if (!accessToken) {
        setError("accessToken 없음. flow 설정 확인 필요.");
        return;
      }

      try {
        const res = await axios.post("/user/oauth/google", { accessToken });

        if (res.data.success) {
          const { token, userId, userNickname, userNo } = res.data;

          localStorage.setItem("token", token);
          localStorage.setItem("nickname", userNickname);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userNo", userNo);
          dispatch(loginSuccess({ token, userId, nickname: userNickname }));

          alert(`${userNickname}님 환영합니다!`);
          navigate("/");
        } else {
          setError("구글 로그인 실패");
        }
      } catch (err) {
        console.error(err);
        setError("구글 로그인 실패 (서버)");
      }
    },
    flow: "implicit",
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
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
    backgroundColor: "#FF8C00",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "0px",
    width: "100%",
  },
  error: { color: "#ff4d4f", marginTop: "10px" },
  socialWrapper: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
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
