import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myReportList.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import { useSelector } from "react-redux";
// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 2025-07-15 수정됨 - 사이드바 토글 기능 추가
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 2025-07-15 수정됨 - 모바일에서 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/api/report/my")
      .then((res) => setReports(res.data))
      .catch((err) => {
        console.error("신고 내역 불러오기 실패", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="report-container">
      <div className="report-content">
        <div className="report-wrapper">
          <div className="report-user-section">
            <button
              className="report-mobile-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>
            <div className="report-board-container">
              <div className="report-board-header">
                <h2 className="report-board-title">내가 신고한 내역</h2>
              </div>

              {loading ? (
                <p style={{ color: "#ccc" }}>로딩 중...</p>
              ) : reports.length === 0 ? (
                <p style={{ color: "#ccc" }}>신고한 내역이 없습니다.</p>
              ) : (
                <table className="report-board-table">
                  <thead>
                    <tr>
                      <th>신고번호</th>
                      <th>게시글 제목</th>
                      <th>신고유형</th>
                      <th>신고내용</th>
                      <th>신고일자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.reportNo}>
                        <td>{report.reportNo}</td>
                        <td>{report.boardTitle}</td>
                        <td>{report.reportType}</td>
                        <td>{report.reportContent}</td>
                        <td>
                          {format(
                            new Date(report.reportDate),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {isSidebarOpen && (
            <div
              className="report-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>
    </div>
  );
};

export default MyReportList;
