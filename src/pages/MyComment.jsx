import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import "../styles/MyBoard.css";

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/comment/my");
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
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    console.log(comments);
  }, [comments]);

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <div className="mypage-container">
        <div className="mypage-content">
          <div className="content-wrapper">
            <div className="mypage-user-section">
              <div className="board-container">
                <p className="error-text">로그인이 필요합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
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
                        <th width="200">작성일</th>
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
                              {new Date(c.commentCreateDate).toLocaleString(
                                "ko-KR",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
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
          <MyPageSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyComments;
