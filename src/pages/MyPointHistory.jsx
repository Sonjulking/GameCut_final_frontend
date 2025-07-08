import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance"; // 인증 포함된 인스턴스
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css";

const MyPointHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    axios
      .get("/point/my")
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.pointDate) - new Date(a.pointDate)
        );
        setHistory(sorted);
      })
      .catch((err) => console.error("포인트 내역 조회 실패", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title-header">
                  내 포인트 내역 ({history.length}건)
                </h2>
              </div>

              <div className="list-view-container">
                <table className="mypage_board_table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>포인트</th>
                      <th style={{ textAlign: "center" }}>출처</th>
                      <th style={{ textAlign: "center" }}>날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center" }}>
                          불러오는 중...
                        </td>
                      </tr>
                    ) : history.length > 0 ? (
                      history.map((item) => (
                        <tr key={item.pointHistoryNo}>
                          <td
                            style={{
                              color:
                                item.pointAmount >= 0 ? "#4caf50" : "#ff5252",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {item.pointAmount.toLocaleString()}P
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.pointSource}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {new Date(item.pointDate).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="mypage_empty_row">
                        <td colSpan="3" style={{ textAlign: "center" }}>
                          포인트 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyPointHistory;
