import { Route, Routes, createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React, { lazy, Suspense } from "react";
import HomePage from "../pages/HomePage.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import BoardDetail from "../pages/BoardDetail.jsx";
import BoardUpdate from "../pages/BoardUpdate.jsx";
import FindPassword from "../pages/FindPassword.jsx";
import Join from "../pages/Join.jsx";
import Login from "../pages/Login.jsx";
import ErrorPage from "../pages/Error.jsx";
const delayImport = (importFunc, delay = 5000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(importFunc()), delay);
  });
};

//로딩 테스트
const Test = lazy(() => delayImport(() => import("../pages/Test.jsx")));
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      //게시글 작성페이지
      { path: "boardWrite", element: <BoardWrite /> },
      { path: "test", element: <Test /> },

      //게시판관련페이지
      { path: "boardDetail", element: <BoardDetail /> },
      { path: "boardUpdate", element: <BoardUpdate /> },

      //로그인관련페이지
      { path: "findPassword", element: <FindPassword /> },
      { path: "join", element: <Join /> },
      { path: "login", element: <Login /> },

      //404에러
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
export default router;
