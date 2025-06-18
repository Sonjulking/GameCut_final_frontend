import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NaverCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 code, state 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      axios
        .post("http://localhost:8081/user/oauth/naver", { code, state })
        .then((res) => {
          if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("nickname", res.data.userNickname);
            localStorage.setItem("userId", res.data.userId);
            alert(`${res.data.userNickname}님 환영합니다!`);
            navigate("/");
          } else {
            alert("네이버 로그인 실패");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("서버 오류 발생");
        });
    }
  }, []);

  return (
    <div style={styles.container}>
      <h2>네이버 로그인 중...</h2>
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
    color: "#fff",
    fontSize: "24px",
  },
};

export default NaverCallback;
