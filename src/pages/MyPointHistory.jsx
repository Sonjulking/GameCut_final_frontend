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
  
  // 2025-07-17 수정됨 - 페이징 상태 추가
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 15,
    isFirst: true,
    isLast: true
  });

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 2025-07-17 수정됨 - 포인트 내역 조회 함수를 페이징 지원으로 변경
  const fetchPointHistory = async (page = 0) => {
    try {
      setLoading(true);
      
      const res = await axiosInstance.get("/api/point/my", {
        params: {
          page: page,
          size: pagination.size
        }
      });
      
      const responseData = res.data;
      console.log('페이징 데이터:', responseData);
      
      // 페이징 정보 업데이트
      setPagination({
        currentPage: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalElements: responseData.totalElements,
        size: responseData.size,
        isFirst: responseData.isFirst,
        isLast: responseData.isLast
      });
      
      setHistory(responseData.content);
    } catch (err) {
      console.error("포인트 내역 조회 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      // 2025-07-17 수정됨 - 초기 로드 시 첫 번째 페이지 가져오기
      fetchPointHistory(0);
    }
  }, [isLoggedIn]);

  // 2025-07-17 수정됨 - 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchPointHistory(newPage);
    }
  };

  // 2025-07-17 수정됨 - 페이지네이션 컴포넌트
  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);
    
    // 마지막 페이지에 과도하게 달라붙지 않도록 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="point-pagination">
        {/* 이전 버튼 */}
        <button
          className="pagination-btn pagination-prev"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.isFirst}
        >
          ‹ 이전
        </button>

        {/* 첫 페이지 버튼 */}
        {startPage > 0 && (
          <>
            <button
              className="pagination-btn pagination-number"
              onClick={() => handlePageChange(0)}
            >
              1
            </button>
            {startPage > 1 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {/* 페이지 번호 버튼 */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`pagination-btn pagination-number ${
              pageNum === pagination.currentPage ? "active" : ""
            }`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* 마지막 페이지 버튼 */}
        {endPage < pagination.totalPages - 1 && (
          <>
            {endPage < pagination.totalPages - 2 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-btn pagination-number"
              onClick={() => handlePageChange(pagination.totalPages - 1)}
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          className="pagination-btn pagination-next"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.isLast}
        >
          다음 ›
        </button>
      </div>
    );
  };

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
                    내 포인트 내역 ({pagination.totalElements}건)
                  </h2>
                  {/* 2025-07-17 수정됨 - 페이지 정보 표시 */}
                  {pagination.totalElements > 0 && (
                    <p className="point-page-info">
                      {pagination.currentPage + 1} / {pagination.totalPages} 페이지
                    </p>
                  )}
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
              
              {/* 2025-07-17 수정됨 - 페이지네이션을 테이블 밖으로 이동 */}
              <PaginationComponent />
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
