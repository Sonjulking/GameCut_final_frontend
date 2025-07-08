import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useSelector } from "react-redux";
// 2025년 7월 7일 수정됨 - updateProfilePhoto import 제거 (통합 API 사용), 불필요한 API 호출 제거
// 2025년 7월 8일 수정됨 - JSP 파일 구조 참고하여 레이아웃 변경

const UpdateMyPage = () => {
  const navigate = useNavigate();
  // 2025년 7월 8일 수정됨 - persist되는 auth.user 사용으로 새로고침 시 프로필 이미지 표시 문제 해결
  const userInfo = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    userName: "",
    userId: "",
    userNickname: "",
    phone: "",
    email: "",
  });
  // 2025년 7월 7일 수정됨 - 프로필 이미지 관련 상태 추가
  // 2025년 7월 8일 수정됨 - 닉네임 중복확인 및 연락처 수정 기능 추가
  const [profileImage, setProfileImage] = useState(null);
  const [deletePhoto, setDeletePhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [originalNickname, setOriginalNickname] = useState("");

  // 2025년 7월 8일 수정됨 - auth.user 사용으로 loading 상태 불필요

  useEffect(() => {
    // 2025년 7월 7일 수정됨 - Redux store에서 직접 데이터 가져오기로 변경 (불필요한 API 호출 제거)
    // 2025년 7월 8일 수정됨 - 추가 필드들 포함하여 form 초기화
    // 2025년 7월 8일 수정됨 - persist되는 auth.user 사용으로 새로고침 시 데이터 유지
    if (userInfo) {
    setForm({
    userName: userInfo.userName || "",
    userId: userInfo.userId || "", // 2025년 7월 7일 수정됨 - userInfo로 데이터 경로 수정
    userNickname: userInfo.userNickname || "", // 2025년 7월 7일 수정됨 - userInfo로 데이터 경로 수정
    phone: userInfo.phone || "",
    email: userInfo.email || "",
  });

      // 2025년 7월 8일 수정됨 - 원래 닉네임 저장
      setOriginalNickname(userInfo.userNickname || "");

      // 기존 프로필 이미지 미리보기 설정
      if (
      userInfo.photo?.photoNo && // 2025년 7월 7일 수정됨 - userInfo.photo.photoNo로 수정
      userInfo.photo.photoNo !== 0 &&
      userInfo.photo?.attachFile?.fileUrl // 2025년 7월 7일 수정됨 - userInfo.photo로 수정
      ) {
      setPreviewUrl(
      `${import.meta.env.VITE_API_URL}${userInfo.photo.attachFile.fileUrl}` // 2025년 7월 7일 수정됨 - userInfo.photo로 수정
      );
      } else {
      setPreviewUrl("/src/assets/img/main/icons/profile_icon.png");
      }

      console.log("유저정보 (Redux에서 가져옴):", userInfo);
    } else {
      // userInfo가 아직 로드되지 않은 경우 기본값 설정
      setPreviewUrl("/src/assets/img/main/icons/profile_icon.png");
    }

    // 로딩 상태 제거됨
  }, [userInfo]); // userInfo 변경 시마다 업데이트

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // 2025년 7월 8일 수정됨 - 닉네임 변경 시 중복확인 상태 초기화
    if (name === 'userNickname') {
      setIsNicknameChecked(false);
    }
  };

  // 2025년 7월 8일 수정됨 - 닉네임 중복확인 기능 추가
  // 2025년 7월 8일 수정됨 - API 엔드포인트 및 응답 처리 오류 수정
  const handleNicknameCheck = async () => {
    const nickname = form.userNickname.trim();
    
    if (!nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    
    // 원래 닉네임과 같다면 중복 확인 없이 통과
    if (nickname === originalNickname) {
      alert("사용 가능한 닉네임입니다.");
      setIsNicknameChecked(true);
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/user/checkUserNickname`, {
        params: { 
          userNickname: nickname
        }
      });
      
      if (response.data.exists) {
        alert("이미 사용 중인 닉네임입니다.");
        setIsNicknameChecked(false);
      } else {
        alert("사용 가능한 닉네임입니다.");
        setIsNicknameChecked(true);
      }
    } catch (error) {
      console.error("닉네임 중복확인 오류:", error);
      alert("닉네임 중복확인 중 오류가 발생했습니다.");
    }
  };

  // 2025년 7월 7일 수정됨 - 파일 선택 핸들러 추가
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setDeletePhoto(false); // 새 파일을 선택하면 삭제 옵션 해제

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2025년 7월 7일 수정됨 - 체크박스에서 버튼으로 변경
  const handleDeletePhoto = () => {
    const newDeleteState = !deletePhoto;
    setDeletePhoto(newDeleteState);

    if (newDeleteState) {
      // 삭제 모드로 전환
      setProfileImage(null);
      setPreviewUrl("/src/assets/img/main/icons/profile_icon.png");
      // 파일 input 초기화
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } else {
      // 삭제 취소 - 기존 이미지로 복원
      if (
        userInfo?.photo?.photoNo && // 2025년 7월 7일 수정됨 - userInfo.photo.photoNo로 수정
        userInfo.photo.photoNo !== 0 &&
        userInfo.photo?.attachFile?.fileUrl // 2025년 7월 7일 수정됨 - userInfo.photo로 수정
      ) {
        setPreviewUrl(
          `${import.meta.env.VITE_API_URL}${userInfo.photo.attachFile.fileUrl}` // 2025년 7월 7일 수정됨 - userInfo.photo로 수정
        );
      } else {
        setPreviewUrl("/src/assets/img/main/icons/profile_icon.png");
      }
    }
  };

  // 2025년 7월 7일 수정됨 - 통합 API로 수정
  // 2025년 7월 8일 수정됨 - 닉네임 중복확인 및 연락처 수정 기능 추가
  const onSubmit = async (e) => {
    e.preventDefault();

    // 닉네임이 변경되었고 중복 확인을 하지 않았다면
    if (form.userNickname !== originalNickname && !isNicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    try {
      // 디버깅: 토큰 확인
      console.log("프로필 업데이트 시작");
      console.log("profileImage:", profileImage);
      console.log("deletePhoto:", deletePhoto);
      console.log("form:", form);

      // FormData 생성 - multipart/form-data로 모든 데이터 전송
      const formData = new FormData();

      // 기본 정보 추가
      // 2025년 7월 8일 수정됨 - 추가 필드들도 FormData에 포함
      formData.append("userName", form.userName);
      formData.append("userId", form.userId);
      formData.append("userNickname", form.userNickname);
      formData.append("phone", form.phone);
      formData.append("email", form.email);

      // 프로필 이미지 처리
      if (deletePhoto) {
        formData.append("deletePhoto", "true");
      }
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // 통합 API 호출
      console.log("통합 API 호출 시작");
      await axiosInstance.put("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("통합 API 호출 성공");

      alert("정보 수정이 완료되었습니다.");
      // 2025년 7월 8일 수정됨 - 수정 후 상태 초기화
      setIsNicknameChecked(false);
      // 수정된 정보 반영한 마이페이지 리로드
      window.location.href = "/mypage/info";
    } catch (err) {
      console.error("오류 상세 정보:", err);
      console.error("응답 데이터:", err.response?.data);
      console.error("상태 코드:", err.response?.status);
      alert(err.response?.data?.message || "수정에 실패했습니다.");
    }
  };

  // 2025년 7월 8일 수정됨 - auth.user 사용으로 로딩 처리 개선
  if (!userInfo) {
    return (
      <div className="main_container">
        <div className="main_content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            사용자 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main_container">
      <div className="main_content">
        <h2 className="joinUserTitle">내 정보 수정</h2>
        <hr />
        <form onSubmit={onSubmit}>
          <div className="form-container">
            {/* 2025년 7월 8일 수정됨 - JSP 구조 참고하여 좌측 컬럼 (프로필 이미지) 추가 */}
            <div className="left-column">
              <div className="profile-image-container">
                <img
                  id="previewImage"
                  src={previewUrl}
                  width="200"
                  height="200"
                  style={{ borderRadius: "100%" }}
                  alt="프로필 이미지"
                />
              </div>

              <div className="form-group file-group">
                <label htmlFor="originalFileName">프로필 이미지:</label>
                <div className="file-controls">
                  <input
                    type="file"
                    name="originalFileName"
                    id="originalFileName"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    id="deleteFile"
                    onClick={handleDeletePhoto}
                  >
                    {deletePhoto ? "삭제 취소" : "사진 삭제"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2025년 7월 8일 수정됨 - JSP 구조 참고하여 우측 컬럼 (입력 필드들) 추가 */}
            <div className="right-column">
              <div className="form-group">
                <label htmlFor="userName">이름:</label>
                <input
                  type="text"
                  name="userName"
                  id="userName"
                  value={form.userName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userId">아이디:</label>
                <input
                  type="text"
                  name="userId"
                  id="userId"
                  value={form.userId}
                  onChange={onChange}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="userNickname">닉네임:</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="userNickname"
                    id="userNickname"
                    value={form.userNickname}
                    onChange={onChange}
                    required
                  />
                  <button type="button" id="checkNickname" onClick={handleNicknameCheck}>
                    중복확인
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">연락처:</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="010-1234-5678"
                  pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">이메일:</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" id="btnOK">
              수정 완료
            </button>
            <button type="button" id="btnReset" onClick={() => navigate(-1)}>
              취소
            </button>
          </div>
        </form>
      </div>

      {/* 2025년 7월 8일 수정됨 - JSP 파일의 CSS 스타일을 인라인으로 추가 */}
      <style>{`
        .main_container {
          width: 100%;
          padding: 1rem;
        }
        
        .main_content {
          width: 100%;
          padding: 2rem;
          background-color: #1a1a1a;
          border-radius: 0.75rem;
          color: #f0f0f0;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .main_content::-webkit-scrollbar {
          width: 0.5rem;
        }
        
        .main_content::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        .main_content::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 0.25rem;
        }
        
        .main_content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .joinUserTitle {
          font-size: 1.5rem;
          color: #f0f0f0;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        hr {
          border: none;
          border-top: 0.0625rem solid #3a3a3a;
          margin: 1.5rem 0;
        }
        
        form {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .form-container {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .left-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .right-column {
          flex: 2;
        }
        
        .profile-image-container {
          margin-bottom: 1.5rem;
          width: 200px;
          height: 200px;
          overflow: hidden;
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #ccc;
        }
        
        .form-group input[type="text"],
        .form-group input[type="tel"],
        .form-group input[type="email"],
        .form-group input[type="file"] {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 0.375rem;
          background-color: #2c2c2c;
          color: white;
        }
        
        .form-group input[type="file"] {
          padding: 0.5rem;
          background-color: transparent;
        }
        
        .form-group input::placeholder {
          color: #888;
          opacity: 1;
        }
        
        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-button input {
          flex: 1;
        }
        
        .file-group {
          width: 100%;
        }
        
        .file-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        button,
        input[type="button"],
        input[type="submit"],
        input[type="reset"] {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.375rem;
          background-color: #3a3a3a;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }
        
        button:hover,
        input[type="button"]:hover,
        input[type="submit"]:hover,
        input[type="reset"]:hover {
          background-color: #555;
        }
        
        #deleteFile {
          background-color: #c62828;
          margin-top: 0.5rem;
        }
        
        #deleteFile:hover {
          background-color: #ef5350;
        }
        
        #checkNickname {
          background-color: #4CAF50;
          white-space: nowrap;
          min-width: 80px;
          font-size: 0.9rem;
        }
        
        #checkNickname:hover {
          background-color: #66BB6A;
        }
        
        .button-group {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-bottom: 1rem;
        }
        
        .button-group button {
          min-width: 8rem;
        }
        
        #btnOK {
          background-color: #4CAF50;
        }
        
        #btnOK:hover {
          background-color: #66BB6A;
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .form-container {
            flex-direction: column;
          }
          
          .left-column, .right-column {
            width: 100%;
          }
          
          .profile-image-container {
            margin: 0 auto 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateMyPage;
