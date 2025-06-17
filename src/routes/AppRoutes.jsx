import { Route, Routes, createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React, { lazy, Suspense } from "react";
import HomePage from "../pages/HomePage.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import FindPassword from "../pages/FindPassword.jsx";
import Join from "../pages/Join.jsx";
import Login from "../pages/Login.jsx";
import ErrorPage from "../pages/Error.jsx";
import NaverCallback from "../pages/NaverCallback";
import BoardList from "../pages/BoardList.jsx";
import BoardDetail from "../pages/BoardDetail.jsx";
import MyPage from "../pages/MyPage.jsx";
import MyBoard from "../pages/MyBoard.jsx";

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
      { path: "board/write", element: <BoardWrite /> },
      { path: "board/edit/:boardNo", element: <BoardWrite isEdit={true} /> },
      { path: "board/list", element: <BoardList /> },
      { path: "board/detail/:boardNo", element: <BoardDetail /> },
      { path: "test", element: <Test /> },
      //로그인관련페이지
      { path: "findPassword", element: <FindPassword /> },
      { path: "join", element: <Join /> },
      { path: "login", element: <Login /> },
      { path: "naver/callback", element: <NaverCallback /> },
      { path: "myPage", element: <MyPage /> },
      { path: "myBoard", element: <MyBoard /> },
      //404에러
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
export default router;
