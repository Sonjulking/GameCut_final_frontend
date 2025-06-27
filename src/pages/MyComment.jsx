import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css"; // 공통 스타일 재활용

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/comment/my")
      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 목록 조회 실패", err));
  }, []);

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <MyPageSidebar />

          <div className="mypage-user-section">
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title-header">
                  내 댓글 ({comments.length}개)
                </h2>
              </div>

              <div className="list-view-container">
                <table className="mypage_board_table">
                  <thead>
                    <tr>
                      <th>댓글 내용</th>
                      <th width="150">작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments && comments.length > 0 ? (
                      comments.map((c) => (
                        <tr
                          key={c.commentNo}
                          onClick={() => navigate(`/board/detail/${c.boardNo}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{c.commentContent}</td>
                          <td>
                            {new Date(c.commentCreateDate).toLocaleDateString(
                              "ko-KR"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="mypage_empty_row">
                        <td colSpan="3">작성한 댓글이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyComments;
