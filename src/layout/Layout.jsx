import React, { useEffect, useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { Outlet, useLocation } from "react-router-dom";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import ChatButton from "../components/Chat/ChatButton.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";

const Layout = () => {
  const location = useLocation(); // 현재 경로
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#141414");
  const [fontSize, setFontSize] = useState("16px");

  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize") || "16px";
    const savedBgColor = localStorage.getItem("bgColor") || "#141414";

    setFontSize(savedFontSize);
    setBgColor(savedBgColor);

    document.body.style.fontSize = savedFontSize;

    // ✅ 헤더도 항상 적용
    const header = document.querySelector("header");
    if (header) {
      header.style.background = `linear-gradient(135deg, ${savedBgColor}, #1e1e1e)`;
    }
  }, []);

  // ✅ 렌더링 시점에서 경로 검사
  const isSettingsPage = location.pathname === "/settings";
  const appliedBgColor = isSettingsPage ? bgColor : "#141414";

  return (
    <div
      className="App"
      style={{ backgroundColor: "#141414", minHeight: "100vh" }} // 🎯 항상 고정
    >
      <Header />
      <div className="main_container">
        <Sidebar />
        <div className="main_content">
          <React.Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </React.Suspense>
        </div>
      </div>

      <ChatButton onClick={() => setIsChatOpen((prev) => !prev)} />
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Layout;
