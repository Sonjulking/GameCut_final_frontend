import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React from "react";

// 페이지 컴포넌트
import HomePage from "../pages/HomePage.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";
import FindPassword from "../pages/FindPassword.jsx";
import Join from "../pages/Join.jsx";
import Login from "../pages/Login.jsx";
import ErrorPage from "../pages/Error.jsx";
import NaverCallback from "../pages/NaverCallback";
import BoardList from "../pages/BoardList.jsx";
import BoardDetail from "../pages/BoardDetail.jsx";
import MyPage from "../pages/MyPage.jsx";
import MyBoard from "../pages/MyBoard.jsx";
import MyItemList from "../pages/MyItemList.jsx";
import Settings from "../pages/Settings.jsx";
import RankingsPage from "../pages/RankingsPage.jsx";
import MyReportList from "../pages/MyReportList.jsx";
import Test from "../pages/Test.jsx"; // ✅ lazy 대신 일반 import
import WebGame from "../pages/WebGame.jsx";
// 웹게임 관련 컴포넌트 분리
import WebGameSelector from "../pages/WebGameSelector.jsx";
import TournamentGame from "../pages/TournamentGame.jsx";
import GuessTheRankGame from "../pages/GuessTheRankGame.jsx";
import { TierCreator } from "../pages/TierCreator.jsx";
import TournamentRanking from "../pages/TournamentRanking.jsx";
import MyComment from "../pages/MyComment.jsx";
import ChangePassword from "../pages/ChangePassword.jsx";
import MyPointHistory from "../pages/MyPointHistory.jsx";
import UpdateMyPage from "../pages/UpdateMyPage.jsx";
import MyMessage from "../pages/MyMessages"; // 🔥 추가
import MyFollow from "../pages/MyFollow.jsx";
import ItemShop from "../pages/ItemShop.jsx"; // 아이템샵 페이지

//관리자페이지
import AdminBoard from "../pages/AdminBoard.jsx";
import ReportList from "../pages/ReporitList.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },

      // 게시판 관련
      { path: "board/write", element: <BoardWrite /> },
      { path: "board/edit/:boardNo", element: <BoardWrite isEdit={true} /> },
      { path: "board/list", element: <BoardList /> },
      { path: "board/detail/:boardNo", element: <BoardDetail /> },

      // 테스트 페이지 (동기 import로 변경됨)
      { path: "test", element: <MyMessage /> },

      // 마이페이지
      { path: "mypage/info", element: <MyPage /> },
      { path: "mypage/board", element: <MyBoard /> },
      { path: "mypage/comment", element: <MyComment /> },
      { path: "mypage/changePassword", element: <ChangePassword /> },
      { path: "/mypage/point", element: <MyPointHistory /> },
      { path: "/mypage/update", element: <UpdateMyPage /> },
      { path: "mypage/message", element: <MyMessage /> },
      { path: "mypage/follow", element: <MyFollow /> },
      { path: "mypage/report", element: <MyReportList /> },
      { path: "mypage/item", element: <MyItemList /> },
      { path: "mypage/admin", element: <AdminBoard /> },
      { path: "admin/reportList", element: <ReportList /> },

      // 로그인 관련
      { path: "findPassword", element: <FindPassword /> },
      { path: "join", element: <Join /> },
      { path: "login", element: <Login /> },
      { path: "naver/callback", element: <NaverCallback /> },
      { path: "myPage", element: <MyPage /> }, // 중복 경로일 수 있음
      { path: "myBoard", element: <MyBoard /> }, // 중복 경로일 수 있음

      // 설정 & 랭킹
      { path: "settings", element: <Settings /> },
      { path: "rankings", element: <RankingsPage /> },

      // 웹게임
      { path: "webgame", element: <WebGameSelector /> },
      { path: "webgame/tournament", element: <TournamentGame /> },
      { path: "webgame/guess-rank", element: <GuessTheRankGame /> },
      { path: "webgame/guess-rank/create", element: <TierCreator /> },
      { path: "webgame/tournament/ranking", element: <TournamentRanking /> },

      { path: "shopping", element: <ItemShop /> },

      // 404
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

export default router;
