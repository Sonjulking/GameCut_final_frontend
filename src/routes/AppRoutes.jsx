import { Route, Routes, createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React, { lazy, Suspense } from "react";
import HomePage from "../pages/HomePage.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import ErrorPage from "../pages/Error.jsx";
import BoardList from "../pages/BoardList.jsx";
import BoardDetail from "../pages/BoardDetail.jsx";
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
      { path: "boardEdit/:boardNo", element: <BoardWrite isEdit={true} /> },
      { path: "boardList", element: <BoardList /> },
      { path: "board/detail/:boardNo", element: <BoardDetail /> },
      { path: "test", element: <Test /> },
      //404에러
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
export default router;
