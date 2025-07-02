import React from "react";
import { useSelector } from "react-redux";

const UserPointInfo = () => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo || !userInfo.userNickname) {
    return <div>사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div style={{ fontWeight: "bold", marginBottom: 16 }}>
      {userInfo.userNickname}: {userInfo.userPoint}P
    </div>
  );
};

export default UserPointInfo;
