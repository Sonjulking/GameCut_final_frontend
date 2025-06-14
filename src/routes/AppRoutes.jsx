import { Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React, { lazy, Suspense } from "react";
import HomePage from "../pages/HomePage.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import BoardList from "../pages/BoardList.jsx";
// ⏱️ 5초 delay wrapper
const delayImport = (importFunc, delay = 5000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(importFunc()), delay);
  });
};

const TestPage = lazy(() => delayImport(() => import("../pages/Test.jsx")));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/boardWrite" element={<BoardWrite />} />
        <Route path="/boardList" element={<BoardList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
