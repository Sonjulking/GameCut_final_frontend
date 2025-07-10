import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import "../styles/myBoard.css";
import "../styles/myMessage.css";
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import { useSelector } from "react-redux";

const MyMessages = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [isSentTab, setIsSentTab] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const loadMessages = async () => {
    try {
      const url = isSentTab ? "/message/sent" : "/message/received";
      const res = await axiosInstance.get(url);
      isSentTab ? setSentMessages(res.data) : setReceivedMessages(res.data);
    } catch (err) {
      console.error("쪽지 불러오기 실패", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [isSentTab]);

  const handleDelete = async (messageNo) => {
    if (!window.confirm("이 쪽지를 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/message/${messageNo}`);
      if (isSentTab) {
        setSentMessages((prev) =>
          prev.filter((msg) => msg.messageNo !== messageNo)
        );
      } else {
        setReceivedMessages((prev) =>
          prev.filter((msg) => msg.messageNo !== messageNo)
        );
      }
    } catch (err) {
      console.error("쪽지 삭제 실패", err);
    }
  };

  const messages = isSentTab ? sentMessages : receivedMessages;

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="mypage-user-section">
            <div className="board-container">
              <div className="board-header">
                <h2 className="board-title">
                  {isSentTab ? "보낸 쪽지함" : "받은 쪽지함"}
                </h2>
                <div className="message-tab-buttons">
                  <button
                    className={isSentTab ? "" : "active"}
                    onClick={() => setIsSentTab(false)}
                  >
                    받은 쪽지함
                  </button>
                  <button
                    className={isSentTab ? "active" : ""}
                    onClick={() => setIsSentTab(true)}
                  >
                    보낸 쪽지함
                  </button>
                </div>
              </div>
              {messages.length === 0 ? (
                <p style={{ color: "#ccc" }}>
                  {isSentTab
                    ? "보낸 쪽지가 없습니다."
                    : "받은 쪽지가 없습니다."}
                </p>
              ) : (
                <table className="board-table">
                  <thead>
                    <tr>
                      <th>{isSentTab ? "받는 사람" : "보낸 사람"}</th>
                      <th>내용</th>
                      <th>날짜</th>
                      <th>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.messageNo}>
                        <td>
                          {isSentTab
                            ? msg.receiveUserNo
                            : msg.sendUserNickname || msg.sendUserNo}
                        </td>
                        <td>{msg.messageContent}</td>
                        <td>
                          {format(
                            new Date(msg.messageDate),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(msg.messageNo)}
                          >
                            삭제
                          </button>
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

export default MyMessages;
