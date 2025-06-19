import React, { useState, useEffect } from "react";

const DEFAULT_FONT = "16px";
const DEFAULT_COLOR = "#141414";

const Settings = () => {
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || DEFAULT_FONT
  );
  const [bgColor, setBgColor] = useState(
    localStorage.getItem("bgColor") || DEFAULT_COLOR
  );

  const applySettings = () => {
    const root = document.querySelector(".App");
    const header = document.querySelector("header");
    const sidebar = document.querySelector(".sidebar");

    document.body.style.fontSize = fontSize;
    if (root) root.style.backgroundColor = bgColor;
    if (header) header.style.backgroundColor = bgColor;
    if (sidebar) sidebar.style.backgroundColor = bgColor;

    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("bgColor", bgColor);
  };

  const resetSettings = () => {
    localStorage.removeItem("fontSize");
    localStorage.removeItem("bgColor");

    setFontSize(DEFAULT_FONT);
    setBgColor(DEFAULT_COLOR);

    const root = document.querySelector(".App");
    const header = document.querySelector("header");
    const sidebar = document.querySelector(".sidebar");

    document.body.style.fontSize = DEFAULT_FONT;
    if (root) root.style.backgroundColor = DEFAULT_COLOR;
    if (header) header.style.backgroundColor = DEFAULT_COLOR;
    if (sidebar) sidebar.style.backgroundColor = DEFAULT_COLOR;
  };

  useEffect(() => {
    applySettings();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛠️ 사용자 설정</h2>

      <div style={styles.section}>
        <label style={styles.label}>글꼴 크기</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={styles.select}
        >
          <option value="14px">작게</option>
          <option value="16px">보통</option>
          <option value="18px">크게</option>
          <option value="20px">매우 크게</option>
        </select>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>배경 색상</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          style={styles.colorInput}
        />
      </div>

      <button
        onClick={applySettings}
        style={{ ...styles.button, backgroundColor: "#FF8C00" }}
      >
        적용하기
      </button>

      <button
        onClick={resetSettings}
        style={{ ...styles.button, backgroundColor: "#555", marginTop: "10px" }}
      >
        설정 초기화
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "25px",
    textAlign: "center",
  },
  section: {
    marginBottom: "25px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontSize: "16px",
  },
  select: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2c2c2c",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "5px",
    fontSize: "14px",
  },
  colorInput: {
    width: "100%",
    height: "50px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  button: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default Settings;
