import React from "react";
import { useNavigate } from "react-router-dom";

const AdminBoard = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

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

        {/* <button
          style={styles.button}
          onClick={() => handleNavigate("/admin/users")}
        >
          👤 회원 관리
        </button>

        <button
          style={styles.button}
          onClick={() => handleNavigate("/admin/posts")}
        >
          📝 게시물 관리
        </button> */}
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
