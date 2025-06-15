import { useRouteError } from "react-router-dom";
import Layout from "../layout/Layout.jsx";

const ErrorPage = () => {
    const error = useRouteError?.(); // 혹시 훅이 없는 상황도 방어
    const status = error?.status || 404; // 기본값을 404로

    const messageMap = {
        404: "404 - 페이지를 찾을 수 없습니다.",
        405: "405 - 허용되지 않은 요청입니다.",
        500: "500 - 서버 오류가 발생했습니다.",
    };

    const message = messageMap[status] || `${status} 에러가 발생했습니다.`;

    return (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                    <h1>🚨 에러 발생</h1>
                    <p>{message}</p>
                    <p>{error?.statusText || error?.message || "에러 정보 없음"}</p>
                </div>
    );
};

export default ErrorPage;
