import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ 로그인 여부 확인
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css";

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // ✅ Redux에서 로그인 여부 확인

  useEffect(() => {
    if (!isLoggedIn) return; // ✅ 로그인 되어 있을 때만 요청 보내기

    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/comment/my"); // accessToken 포함된 요청
        setComments(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ 댓글 목록 조회 실패", err);
        if (err.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
        } else {
          setError("댓글 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isLoggedIn, navigate]); // ✅ isLoggedIn 변화 감지

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
                {loading ? (
                  <p className="loading-text">댓글을 불러오는 중...</p>
                ) : error ? (
                  <p className="error-text">{error}</p>
                ) : (
                  <table className="mypage_board_table">
                    <thead>
                      <tr>
                        <th>댓글 내용</th>
                        <th width="150">작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.length > 0 ? (
                        comments.map((c) => (
                          <tr
                            key={c.commentNo}
                            onClick={() =>
                              navigate(`/board/detail/${c.boardNo}`)
                            }
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
                          <td colSpan="2">작성한 댓글이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyComments;
