import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const AdminBoard = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);
  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    } else if (user.role !== "ROLE_ADMIN") {
      alert("권한이 없습니다.");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>관리자 대시보드</h1>

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => handleNavigate("/admin/reportList")}
        >
          🚨 신고글 관리
        </button>

        {
          <button
            style={styles.button}
            onClick={() => handleNavigate("/admin/users")}
          >
            👤 회원 관리
          </button>

          /*<button
          style={styles.button}
          onClick={() => handleNavigate("/admin/posts")}
        >
          📝 게시물 관리
        </button> */
        }
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#1e1e1e",
    minHeight: "100vh",
    color: "#ffffff",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "40px",
    textAlign: "center",
    color: "#58a6ff",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  button: {
    padding: "20px 30px",
    fontSize: "18px",
    backgroundColor: "#2c2c2c",
    border: "1px solid #444",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#ffffff",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
};

export default AdminBoard;
