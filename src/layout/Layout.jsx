import React, { useEffect, useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import ChatButton from "../components/Chat/ChatButton.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";

const Layout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // 저장된 설정값 불러와 초기 반영
    const fontSize = localStorage.getItem("fontSize") || "16px";
    const bgColor = localStorage.getItem("bgColor") || "#141414";

    const app = document.querySelector(".App");
    const header = document.querySelector("header");
    const sidebar = document.querySelector(".sidebar");

    if (app) app.style.backgroundColor = bgColor;
    if (header) header.style.backgroundColor = bgColor;
    if (sidebar) sidebar.style.backgroundColor = bgColor;

    document.body.style.fontSize = fontSize;
  }, []);

  return (
    <div className="App">
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
