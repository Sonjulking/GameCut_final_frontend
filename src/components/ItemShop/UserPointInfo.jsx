import React from "react";
import { useSelector } from "react-redux";

const UserPointInfo = () => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo || !userInfo.userNickname) {
    return <div>사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="itemshop-userinfo">
      사용자 닉네임 : {userInfo.userNickname}
      <br />
      현재 포인트 :
      <span style={{ color: "yellow" }}> {userInfo.userPoint} P</span>
    </div>
  );
};

export default UserPointInfo;
