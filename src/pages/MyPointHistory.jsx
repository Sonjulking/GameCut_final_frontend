import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myPointHistory.css"; // ⚠️ 새 CSS 파일
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";
import { formatRelativeTimeKo } from "../util/timeFormatUtil.js";

const MyPointHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    axiosInstance
      .get("/api/point/my")
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.pointDate) - new Date(a.pointDate)
        );
        setHistory(sorted);
      })
      .catch((err) => console.error("포인트 내역 조회 실패", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSidebar();
  };

  return (
    <div className="point-container">
      <div className="point-content">
        <div className="point-wrapper">
          <div className="point-section">
            <button
              className="mypage-mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>

            <div className="point-inner">
              <div className="point-header">
                <div className="point-header-content">
                  <h2 className="point-title-header">
                    내 포인트 내역 ({history.length}건)
                  </h2>
                </div>
              </div>

              <div className="point-list-view">
                <table className="point-table">
                  <thead>
                    <tr>
                      <th>포인트</th>
                      <th>출처</th>
                      <th>날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="point-empty">
                          불러오는 중...
                        </td>
                      </tr>
                    ) : history.length > 0 ? (
                      history.map((item) => (
                        <tr key={item.pointHistoryNo}>
                          <td
                            className={`point-amount ${
                              item.pointAmount >= 0 ? "plus" : "minus"
                            }`}
                          >
                            {item.pointAmount >= 0 ? "+" : ""}
                            {item.pointAmount.toLocaleString()}P
                          </td>
                          <td className="point-source">{item.pointSource}</td>
                          <td className="point-date">
                            {formatRelativeTimeKo(item.pointDate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="point-empty">
                          포인트 내역이 없습니다.
                          <br />
                          <small>적립 또는 사용 시 이곳에 표시됩니다.</small>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          {/* 2025-07-15 수정됨 - 사이드바에 상태 props 전달 */}
          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>
    </div>
  );
};

export default MyPointHistory;
