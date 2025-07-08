import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../store/itemSlice";
import { fetchUser } from "../store/userSlice";
import ItemList from "../components/ItemShop/ItemList";
import UserPointInfo from "../components/ItemShop/UserPointInfo";
import ItemUploadButton from "../components/ItemShop/ItemUploadButton";
import "../styles/itemshop.css";
import { useNavigate } from "react-router-dom"; // ✅ 추가

const ItemShopPage = () => {
  const dispatch = useDispatch();
  const { itemList } = useSelector((state) => state.item);
  const { userInfo } = useSelector((state) => state.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // 🔐 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    dispatch(fetchItems());
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <div className="itemshop-container">
      <div className="itemshop-header">
        <UserPointInfo userInfo={userInfo} />
        {userInfo?.role === "ROLE_ADMIN" && (
          <ItemUploadButton userInfo={userInfo} />
        )}
      </div>
      <ItemList itemList={itemList} userInfo={userInfo} />
    </div>
  );
};

export default ItemShopPage;
