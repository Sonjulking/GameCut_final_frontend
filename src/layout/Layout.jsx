import React, { useEffect, useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import ChatButton from "../components/Chat/ChatButton.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";

const Layout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#141414");
  const [fontSize, setFontSize] = useState("16px");

  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize") || "16px";
    const savedBgColor = localStorage.getItem("bgColor") || "#141414";

    setFontSize(savedFontSize);
    setBgColor(savedBgColor);

    // ✅ body 스타일은 여전히 직접 적용해도 괜찮음
    document.body.style.fontSize = savedFontSize;
  }, []);

  return (
    <div
      className="App"
      style={{ backgroundColor: bgColor, minHeight: "100vh" }}
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
