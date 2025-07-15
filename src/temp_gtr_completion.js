// MyGTRHistory.jsx 완성을 위한 나머지 수정사항
// 이 파일에 토글 함수들과 JSX 수정 필요

  // 토글 함수들 추가
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

// JSX 수정:
// 1. mypage-user-section 시작 부분에 햄버거 버튼 추가
// 2. MyPageSidebar 컴포넌트에 props 추가
