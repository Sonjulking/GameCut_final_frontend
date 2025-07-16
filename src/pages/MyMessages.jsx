// 2025-07-16 수정됨 - 내 쪽지함 페이지 스타일 개선 (다른 마이페이지와 통일)
import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import "../styles/myMessage.css"; // ⚠️ 새 CSS 파일
import MyPageSidebar from "../components/MyPage/MyPageSidebar";
import MessageDetailPopup from "../components/MyPage/MessageDetailPopup"; // 2025-07-14 추가됨
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// 2025-07-15 수정됨 - 모바일 사이드바 토글 기능 추가
import hamburgerIcon from "../assets/img/main/icons/hamburger_icon.png";

const MyMessages = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [isSentTab, setIsSentTab] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 2025-07-15 수정됨 - 사이드바 상태 관리 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSidebar();
  };

  const loadMessages = async () => {
    try {
      const url = isSentTab ? "/api/message/sent" : "/api/message/received";
      const res = await axiosInstance.get(url);
      isSentTab ? setSentMessages(res.data) : setReceivedMessages(res.data);
    } catch (err) {
      console.error("쪽지 불러오기 실패", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [isSentTab]);

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsPopupOpen(true);
  };

  const truncateContent = (content, maxLength = 30) => {
    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const handleDelete = async (messageNo) => {
    if (!window.confirm("이 쪽지를 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/api/message/${messageNo}`);
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
    <div className="messages-container">
      <div className="messages-content">
        <div className="messages-wrapper">
          <div className="messages-section">
            <button
              className="mypage-mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="마이페이지 메뉴 토글"
            >
              <img src={hamburgerIcon} alt="마이페이지 메뉴" />
            </button>

            <div className="messages-header">
              <h2 className="messages-title-header">
                {isSentTab ? "보낸 쪽지함" : "받은 쪽지함"}
              </h2>
              <p className="messages-subtitle">
                {isSentTab ? "보낸 쪽지들을 확인하고 관리하세요" : "받은 쪽지들을 확인하고 관리하세요"}
              </p>
              <div className="messages-tab-buttons">
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
              <div className="messages-empty">
                <h3>쪽지가 없습니다</h3>
                <p>
                  {isSentTab
                    ? "보낸 쪽지가 없습니다."
                    : "받은 쪽지가 없습니다."}
                </p>
              </div>
            ) : (
              <div className="messages-table-container">
                <table className="messages-board-table">
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
                        <td>
                          <span
                            className="messages-message-content"
                            onClick={() => handleMessageClick(msg)}
                            title="클릭하여 전체 내용 보기"
                          >
                            {truncateContent(msg.messageContent)}
                          </span>
                        </td>
                        <td>
                          {format(
                            new Date(msg.messageDate),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </td>
                        <td>
                          <button
                            className="messages-delete-button"
                            onClick={() => handleDelete(msg.messageNo)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isSidebarOpen && (
            <div
              className="messages-sidebar-overlay"
              onClick={handleOverlayClick}
            />
          )}

          <MyPageSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>

      <MessageDetailPopup
        open={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        isSentTab={isSentTab}
      />
    </div>
  );
};

export default MyMessages;
