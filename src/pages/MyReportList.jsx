import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css";
import { format } from "date-fns";

const MyReportList = () => {
  const [reports, setReports] = useState([]);
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
    axiosInstance
      .get("/report/my")
      .then((res) => setReports(res.data))
      .catch((err) => {
        console.error("신고 내역 불러오기 실패", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title">내가 신고한 내역</h2>
              </div>

              {loading ? (
                <p style={{ color: "#ccc" }}>로딩 중...</p>
              ) : reports.length === 0 ? (
                <p style={{ color: "#ccc" }}>신고한 내역이 없습니다.</p>
              ) : (
                <table className="board-table">
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

          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyReportList;
