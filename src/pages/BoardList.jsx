import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/boardList.css";

const BoardList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [viewMode, setViewMode] = useState("card"); // 'list' 또는 'card'
  const [selectedType, setSelectedType] = useState("전체"); // 선택된 타입

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

  const loadData = async () => {
    await axios.get("http://localhost:8081/board/listAll").then((res) => {
      setList(res.data);
      setFilteredList(res.data); // 초기에는 전체 목록 표시
    });
  };

  // 타입별 필터링 함수
  const filterByType = (type) => {
    setSelectedType(type);
    if (type === "전체") {
      setFilteredList(list);
    } else {
      const typeNo = getBoardTypeNo(type);
      const filtered = list.filter((board) => board.boardTypeNo === typeNo);
      setFilteredList(filtered);
    }
  };

  const handleTitleClick = (boardNo) => {
    navigate(`/board/detail/${boardNo}`);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  // 데이터가 변경될 때마다 현재 선택된 타입으로 필터링
  useEffect(() => {
    filterByType(selectedType);
  }, [list]);

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
        </tr>
      </thead>
      <tbody>
        {filteredList && filteredList.length > 0 ? (
          filteredList.map((board) => {
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
                <td>{board.userNo}</td>
                <td>{board.boardCount}</td>
                <td>{board.boardLike}</td>
                <td>{board.boardCreateDate}</td>
              </tr>
            );
          })
        ) : (
          <tr className="mypage_empty_row">
            <td colSpan="7">등록된 게시글이 없습니다.</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // 카드 뷰 렌더링
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
                  src={board.thumbnail || "/default-thumbnail.jpg"}
                  alt={board.boardTitle}
                  className="board-thumbnail"
                />
                <div className={`card-type-badge type-${board.boardTypeNo}`}>
                  {typeName}
                </div>
              </div>
              <div className="board-info">
                <h3 className="board-title">{board.boardTitle}</h3>
                <div className="board-meta">
                  <p className="board-author">작성자: {board.userNo}</p>
                  <div className="board-stats">
                    <span className="board-views">
                      조회수 {board.boardCount}
                    </span>
                    <span className="board-likes">
                      좋아요 {board.boardLike}
                    </span>
                  </div>
                  <p className="board-date">{board.boardCreateDate}</p>
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
        <h2 className="board-title-header">게시글 목록</h2>
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
                <span className="active-count">
                  ({selectedType === "전체" ? list.length : filteredList.length}
                  )
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          className="write-btn"
          onClick={() => navigate("/boardWrite")}
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
    </div>
  );
};

export default BoardList;
