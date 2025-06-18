// src/App.jsx
import React from "react";
import "./App.css";
import router from "./routes/AppRoutes.jsx";
import { RouterProvider } from "react-router-dom";
import useAuthInit from "./hooks/useAuthInit"; // 경로 확인

function App() {
  useAuthInit(); // ✅ 로그인 상태 복원 로직 실행

  return <RouterProvider router={router} />;
}

export default App;
