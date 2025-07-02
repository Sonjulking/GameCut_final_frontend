import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/boardList.css";
import { Button, Stack } from "@mui/material";
import axiosInstance from "../lib/axiosInstance";

const BoardList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1); // 먼저 선언
  const [totalElements, setTotalElements] = useState(1); // 먼저 선언

  const pageParamRaw = parseInt(searchParams.get("page") || "1", 10); // 기본은 1
  const pageParam = isNaN(pageParamRaw) ? 0 : pageParamRaw - 1; // 내부용은 0부터 시작

  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [viewMode, setViewMode] = useState("card"); // 'list' 또는 'card'

  const typeParam = searchParams.get("type") || "전체";
  const [selectedType, setSelectedType] = useState(typeParam);

  const boardTypes = ["전체", "자유", "공략", "영상"];

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

  const loadData = async (page, boardTypeNo) => {
    const size = viewMode === "card" ? 6 : 10;
    const params = { page, size };

    if (boardTypeNo !== null) {
      params.boardTypeNo = boardTypeNo;
    }

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/board/listAll`,
      {
        params,
      }
    );

    setList(res.data.content);
    setTotalPages(res.data.totalPages);
    setTotalElements(res.data.totalElements);
  };

  // 타입별 필터링 함수
  const filterByType = (type) => {
    setSelectedType(type);
    setSearchParams({ page: 1, type }); // page 초기화
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
        await axiosInstance.delete(
          `${import.meta.env.VITE_API_URL}/board/${boardNo}`
        );
        alert("게시글이 삭제되었습니다.");

        // 삭제 후 목록 새로고침
        const typeNo = getBoardTypeNo(selectedType);
        loadData(pageParam, typeNo);
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    const typeNo = getBoardTypeNo(selectedType);
    loadData(pageParam, typeNo); // 선택된 타입과 페이지 기반으로 요청
  }, [pageParam, selectedType]);

  // useEffect(() => {
  //   console.log(list);
  // }, [list]);

  const currentGroup = Math.floor(pageParam / 10);
  const startPage = currentGroup * 10;
  const endPage = Math.min(startPage + 10, totalPages);

  // 리스트 뷰 렌더링
  const renderListView = () => (
    <table className="mypage_board_table">
      <thead>
        <tr>
          <th>번호</th>
          <th>타입</th>
          <th>제목</th>
          <th>작성자(번호)</th>
          <th>조회수</th>
          <th>좋아요</th>
          <th>작성일</th>
          <th width="120">관리</th>
        </tr>
      </thead>
      <tbody>
        {list && list.length > 0 ? (
          list.map((board) => {
            const typeName = getBoardTypeName(board.boardTypeNo);
            return (
              <tr key={board.boardNo}>
                <td>{board.boardNo}</td>
                <td>
                  <span
                    className={`board-type-badge type-${board.boardTypeNo}`}
                  >
                    {typeName}
                  </span>
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
                <td>{board.user.userNickname}</td>
                <td>{board.boardCount}</td>
                <td>{board.boardLike}</td>
                <td>{new Date(board.boardCreateDate).toLocaleString()}</td>
                <td>
                  {false ? (
                    <div className="action-buttons">
                      <button className="edit-btn">수정</button>
                      <button className="delete-btn">삭제</button>
                    </div>
                  ) : (
                    <span className="no-action">-</span> // 본인 게시글이 아닐 때
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr className="mypage_empty_row">
            <td colSpan="8">등록된 게시글이 없습니다.</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // 카드 뷰 렌더링
  const renderCardView = () => (
    <div className="board-card-container">
      {list && list.length > 0 ? (
        list.map((board) => {
          const typeName = getBoardTypeName(board.boardTypeNo);
          return (
            <div
              key={board.boardNo}
              className="board-card"
              onClick={() => handleTitleClick(board.boardNo)}
            >
              <div className="thumbnail-container">
                <img
                  src={
                    board.photos[0]?.attachFile.fileUrl
                      ? `${import.meta.env.VITE_API_URL}` +
                        board.photos[0]?.attachFile.fileUrl
                      : "/common/empty.png"
                  }
                  alt={board.boardTitle}
                  className={`board-thumbnail
                ${
                  !board.photos[0]?.attachFile.fileUrl ? "empty-thumbnail" : ""
                } `}
                />
                <div className={`card-type-badge type-${board.boardTypeNo}`}>
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
                  <p className="board-author">
                    작성자: {board.user.userNickname}
                  </p>
                  <div className="board-stats">
                    <span className="board-views">
                      조회수 {board.boardCount}
                    </span>
                    <span className="board-likes">
                      좋아요 {board.boardLike}
                    </span>
                  </div>
                  <p className="board-date">
                    {new Date(board.boardCreateDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <p>등록된 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="board-container">
      {/* 헤더와 토글 버튼 */}
      <div className="board-header">
        <h2 className="board-title-header"></h2>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="리스트 보기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </button>
          <button
            className={`toggle-btn ${viewMode === "card" ? "active" : ""}`}
            onClick={() => setViewMode("card")}
            title="카드 보기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
                <span className="active-count">({totalElements})</span>
              )}
            </button>
          ))}
        </div>
        <button
          className="write-btn"
          onClick={() => navigate("/board/write")}
          title="새 글 작성"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          글쓰기
        </button>
      </div>

      {/* 뷰 모드에 따른 렌더링 */}
      <div className="board-content">
        {viewMode === "list" ? renderListView() : renderCardView()}
      </div>

      <div className="pagination">
        {startPage > 0 && (
          <button
            onClick={() =>
              setSearchParams({
                page: startPage,
                type: selectedType,
              })
            }
          >
            ◀
          </button>
        )}
        {Array.from({ length: endPage - startPage }).map((_, i) => {
          const pageNumber = startPage + i;
          return (
            <button
              key={pageNumber}
              className={pageParam === pageNumber ? "active" : ""}
              onClick={() =>
                setSearchParams({
                  page: pageNumber + 1,
                  type: selectedType,
                })
              }
            >
              {pageNumber + 1}
            </button>
          );
        })}
        {endPage < totalPages && (
          <button
            onClick={() =>
              setSearchParams({
                page: endPage + 1,
                type: selectedType,
              })
            }
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardList;
