import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/myBoard.css";
import { useSelector } from "react-redux";

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";
// 2025-07-15 수정됨 - 시간 표시 포맷 유틸리티 추가 (boardList와 동일)
import { formatRelativeTimeKo } from "../util/timeFormatUtil.js";

const MyBoard = () => {
  const navigate = useNavigate();
  const [myBoards, setMyBoards] = useState([]);
  const [allMyBoards, setAllMyBoards] = useState([]); // 2025-07-17 수정됨 - 전체 데이터 보관용
  const [filteredList, setFilteredList] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const [selectedType, setSelectedType] = useState("전체");

  // 2025-07-17 수정됨 - 페이징 상태 추가
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 6, // 2025-07-17 수정됨 - 6개씩 표시
    isFirst: true,
    isLast: true,
  });

  const user = useSelector((state) => state.auth.user);

  // 체크박스 관련 상태 추가
  const [selectedBoards, setSelectedBoards] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const boardTypes = ["전체", "자유", "공략", "영상"];
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // boardTypeNo를 타입명으로 변환하는 함수
  const getBoardTypeName = (boardTypeNo) => {
    switch (boardTypeNo) {
      case 1:
        return "자유";
      case 2:
        return "공략";
      case 3:
        return "영상";
      default:
        return "기타";
    }
  };

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

  // 타입명을 boardTypeNo로 변환하는 함수
  const getBoardTypeNo = (typeName) => {
    switch (typeName) {
      case "자유":
        return 1;
      case "공략":
        return 2;
      case "영상":
        return 3;
      default:
        return null;
    }
  };

  // 체크박스 관련 함수들
  const handleSelectBoard = (boardNo) => {
    const newSelected = new Set(selectedBoards);
    if (newSelected.has(boardNo)) {
      newSelected.delete(boardNo);
    } else {
      newSelected.add(boardNo);
    }
    setSelectedBoards(newSelected);
    setIsAllSelected(
      newSelected.size === filteredList.length && filteredList.length > 0
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBoards(new Set());
      setIsAllSelected(false);
    } else {
      const allBoardNos = new Set(filteredList.map((board) => board.boardNo));
      setSelectedBoards(allBoardNos);
      setIsAllSelected(true);
    }
  };

  // 선택된 게시글들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedBoards.size === 0) {
      alert("삭제할 게시글을 선택해주세요.");
      return;
    }

    const selectedTitles = filteredList
      .filter((board) => selectedBoards.has(board.boardNo))
      .map((board) => board.boardTitle)
      .join(", ");

    if (
      window.confirm(
        `선택된 ${selectedBoards.size}개의 게시글을 정말 삭제하시겠습니까?\n\n${selectedTitles}`
      )
    ) {
      try {
        // 선택된 게시글들을 순차적으로 삭제
        const deletePromises = Array.from(selectedBoards).map((boardNo) =>
          axiosInstance.delete(`/api/board/delete/${boardNo}`)
        );

        await Promise.all(deletePromises);

        alert(`${selectedBoards.size}개의 게시글이 삭제되었습니다.`);

        // 삭제 후 목록 새로고침 및 선택 상태 초기화
        setSelectedBoards(new Set());
        setIsAllSelected(false);

        if (user) {
          await loadMyBoards(user);
        }
      } catch (error) {
        console.error("일괄 삭제 실패:", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 2025-07-17 수정됨 - 내 게시글 로드 함수를 페이징 지원으로 변경
  const fetchMyBoards = async (page = 0, typeFilter = null) => {
    try {
      console.log("현재 로그인 사용자:", user); // 디버깅용
      console.log("타입 필터:", typeFilter); // 디버깅용
      
      const params = {
        page: page,
        size: pagination.size,
      };
      
      // 타입 필터가 있으면 추가
      if (typeFilter && typeFilter !== "전체") {
        const typeNo = getBoardTypeNo(typeFilter);
        if (typeNo) {
          params.boardTypeNo = typeNo;
        }
      }
      
      const res = await axiosInstance.get("/api/board/my", {
        params: params,
      });

      const responseData = res.data;
      console.log("페이징 데이터:", responseData);
      console.log("받아온 게시글 데이터:", responseData.content);

      // 페이징 정보 업데이트
      setPagination({
        currentPage: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalElements: responseData.totalElements,
        size: responseData.size,
        isFirst: responseData.isFirst,
        isLast: responseData.isLast,
      });

      const boardsData = responseData.content;
      
      // 2025-07-17 수정됨 - 디버깅: 게시글의 작성자 정보 확인
      if (boardsData.length > 0) {
        console.log("첫 번째 게시글 작성자:", boardsData[0].user);
        console.log("현재 로그인 사용자 번호:", user?.userNo);
      }
      
      setMyBoards(boardsData);
      setAllMyBoards(boardsData); // 전체 데이터도 보관
      setFilteredList(boardsData);
      
      // 선택 상태 초기화
      setSelectedBoards(new Set());
      setIsAllSelected(false);
      
    } catch (error) {
      console.error("❌ 내 게시글 로드 실패:", error);
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("게시글 목록을 불러오는 데 실패했습니다.");
      }
    }
  };

  // 기존 loadMyBoards 함수도 유지 (삭제/수정 후 새로고침용)
  const loadMyBoards = async () => {
    await fetchMyBoards(0, selectedType); // 선택된 타입으로 첫 번째 페이지 리셋
  };

  // 2025-07-17 수정됨 - 페이지 변경 함수 (타입 필터 고려)
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchMyBoards(newPage, selectedType);
    }
  };

  // 2025-07-17 수정됨 - 페이지네이션 컴포넌트
  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(
      0,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages - 1,
      startPage + maxVisiblePages - 1
    );

    // 마지막 페이지에 과도하게 달라붙지 않도록 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="board-pagination">
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

  // 2025-07-17 수정됨 - 타입별 필터링 함수 (백엔드에서 필터링)
  const filterByType = (type) => {
    setSelectedType(type);
    // 필터링 시 선택 상태 초기화
    setSelectedBoards(new Set());
    setIsAllSelected(false);

    // 백엔드에서 필터링하여 데이터 가져오기
    fetchMyBoards(0, type); // 첫 번째 페이지로 리셋하여 가져오기
  };

  // 게시글 상세보기
  const handleTitleClick = (boardNo) => {
    navigate(`/board/detail/${boardNo}`);
  };

  // 게시글 수정하기
  const handleEditClick = (e, boardNo) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    navigate(`/board/edit/${boardNo}`);
  };

  // 게시글 삭제하기
  const handleDeleteClick = async (e, boardNo, boardTitle) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    if (window.confirm(`"${boardTitle}" 게시글을 정말 삭제하시겠습니까?`)) {
      try {
        await axiosInstance.delete(`/api/board/delete/${boardNo}`);
        alert("게시글이 삭제되었습니다.");

        // 삭제 후 목록 새로고침
        if (user) {
          loadMyBoards(user);
        }
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 썸네일 이미지 URL 처리
  const getThumbnailUrl = (board) => {
    if (
      board.photos &&
      board.photos.length > 0 &&
      board.photos[0]?.attachFile?.fileUrl
    ) {
      return `${import.meta.env.VITE_API_URL}${
        board.photos[0].attachFile.fileUrl
      }`;
    }
    return "/src/assets/img/default-thumbnail.jpg";
  };

  useEffect(() => {
    const initializeData = async () => {
      // 2025-07-17 수정됨 - 페이징 지원 함수로 변경
      await fetchMyBoards(0, "전체"); // 초기에는 전체 타입으로 로드
    };

    if (isLoggedIn) {
      initializeData();
    }
  }, [isLoggedIn]);

  // 2025-07-17 수정됨 - 더 이상 필요없음 (백엔드에서 필터링하므로)
  // useEffect(() => {
  //   filterByType(selectedType);
  // }, [myBoards, selectedType]);

  // 리스트 뷰 렌더링 (체크박스와 썸네일 추가)
  const renderListView = () => (
    <div className="list-view-container">
      <table className="mypage_board_table">
        <thead>
          <tr>
            <th width="50">
              <div className="select-all-container">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="select-all-checkbox"
                />
              </div>
            </th>
            <th width="60">번호</th>
            <th width="80">타입</th>
            <th width="80">썸네일</th>
            <th>제목</th>
            <th width="80">조회수</th>
            <th width="80">좋아요</th>
            <th width="100">작성일</th>
            <th width="120">관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredList && filteredList.length > 0 ? (
            filteredList.map((board) => {
              const typeName = getBoardTypeName(board.boardTypeNo);
              const isSelected = selectedBoards.has(board.boardNo);

              return (
                <tr
                  key={board.boardNo}
                  className={isSelected ? "selected-row" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectBoard(board.boardNo)}
                      className="board-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>{board.boardNo}</td>
                  <td>
                    <span
                      className={`board-type-badge type-${board.boardTypeNo}`}
                    >
                      {typeName}
                    </span>
                  </td>
                  <td className="thumbnail-cell">
                    <img
                      src={getThumbnailUrl(board)}
                      alt={board.boardTitle}
                      className="list-thumbnail"
                    />
                  </td>
                  <td className="title_cell">
                    <span
                      className="board_title_link"
                      onClick={() => handleTitleClick(board.boardNo)}
                      style={{ cursor: "pointer" }}
                    >
                      {board.boardTitle}
                    </span>
                  </td>
                  <td>{board.boardCount}</td>
                  <td>{board.boardLike}</td>
                  <td>
                    {/* 2025-07-15 수정됨 - 상대적 시간 표시로 변경 (boardList와 동일) */}
                    {formatRelativeTimeKo(board.boardCreateDate)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={(e) => handleEditClick(e, board.boardNo)}
                        title="수정"
                      >
                        수정
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) =>
                          handleDeleteClick(e, board.boardNo, board.boardTitle)
                        }
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="mypage_empty_row">
              <td colSpan="9">작성한 게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // 카드 뷰 렌더링 (기존과 동일)
  const renderCardView = () => (
    <div className="board-card-container">
      {filteredList && filteredList.length > 0 ? (
        filteredList.map((board) => {
          const typeName = getBoardTypeName(board.boardTypeNo);
          return (
            <div
              key={board.boardNo}
              className="board-card"
              onClick={() => handleTitleClick(board.boardNo)}
            >
              <div className="thumbnail-container">
                <img
                  src={getThumbnailUrl(board)}
                  alt={board.boardTitle}
                  className="board-thumbnail"
                />
                <div className={`my-card-type-badge type-${board.boardTypeNo}`}>
                  {typeName}
                </div>
                <div className="card-actions">
                  <button
                    className="card-edit-btn"
                    onClick={(e) => handleEditClick(e, board.boardNo)}
                    title="수정"
                  >
                    수정
                  </button>
                  <button
                    className="card-delete-btn"
                    onClick={(e) =>
                      handleDeleteClick(e, board.boardNo, board.boardTitle)
                    }
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="board-info">
                <h3 className="board-title">{board.boardTitle}</h3>
                <div className="board-meta">
                  <div className="board-stats">
                    <span className="board-views">
                      조회수 {board.boardCount}
                    </span>
                    <span className="board-likes">
                      좋아요 {board.boardLike}
                    </span>
                  </div>
                  <p className="board-date">
                    {/* 2025-07-15 수정됨 - 상대적 시간 표시로 변경 (boardList와 동일) */}
                    {formatRelativeTimeKo(board.boardCreateDate)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <p>작성한 게시글이 없습니다.</p>
          <button
            className="write-first-btn"
            onClick={() => navigate("/board/write")}
          >
            첫 번째 게시글 작성하기
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mypage-container">
      <div className="content-wrapper">
        {/* 메인 내용 영역 */}
        <div className="mypage-user-section">
          {/* 2025-07-15 수정됨 - 사용자 섹션 내부에 햄버거 버튼 추가 */}
          <button
            className="mypage-mobile-menu-toggle"
            onClick={toggleSidebar}
            aria-label="마이페이지 메뉴 토글"
          >
            <img src={hamburgerIcon} alt="마이페이지 메뉴" />
          </button>

          <div className="board-container">
            {/* 2025-07-15 수정됨 - 헤더 스타일 통일 */}
            <div className="board-header">
              <div className="board-header-content">
                <h2 className="myboard-title-header">
                  내 게시글 ({pagination.totalElements}개)
                </h2>
                {/* 2025-07-17 수정됨 - 페이지 정보 표시 */}
                {pagination.totalElements > 0 && (
                  <p className="board-page-info">
                    {pagination.currentPage + 1} / {pagination.totalPages} 페이지
                  </p>
                )}
              </div>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${
                    viewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  title="리스트 보기"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                  </svg>
                </button>
                <button
                  className={`toggle-btn ${
                    viewMode === "card" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("card")}
                  title="카드 보기"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 타입 필터 버튼들과 글작성 버튼 */}
            <div className="filter-and-write-container">
              <div className="type-filter-container">
                {boardTypes.map((type) => (
                  <button
                    key={type}
                    className={`type-filter-btn ${
                      selectedType === type ? "active" : ""
                    }`}
                    onClick={() => filterByType(type)}
                  >
                    {type}
                    {selectedType === type && (
                      <span className="active-count">
                        ({pagination.totalElements})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedBoards.size > 0 && (
                <button
                  className="bulk-delete-btn"
                  onClick={handleBulkDelete}
                  title={`선택된 ${selectedBoards.size}개 항목 삭제`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  선택삭제 ({selectedBoards.size})
                </button>
              )}
              <button
                className="write-btn"
                onClick={() => navigate("/board/write")}
                title="새 글 작성"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                글쓰기
              </button>
            </div>

            {/* 뷰 모드에 따른 렌더링 */}
            <div className="board-content">
              {viewMode === "list" ? renderListView() : renderCardView()}
              
              {/* 2025-07-17 수정됨 - 페이지네이션 컴포넌트 추가 */}
              <PaginationComponent />
            </div>
          </div>
        </div>

        {/* 2025-07-15 수정됨 - 모바일 오버레이 추가 */}
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
  );
};

export default MyBoard;
