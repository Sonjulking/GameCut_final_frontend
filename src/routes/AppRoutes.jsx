// src/router/AppRoutes.jsx
import {createBrowserRouter} from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import BoardWrite from "../pages/BoardWrite";
import ErrorPage from "../pages/Error.jsx";
import {lazy} from "react";
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
            //404에러
            { path: "*", element: <ErrorPage /> },
        ],
    },
]);
export default router;