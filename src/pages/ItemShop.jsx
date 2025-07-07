import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../store/itemSlice";
import { fetchUser } from "../store/userSlice";
import ItemList from "../components/ItemShop/ItemList";
import UserPointInfo from "../components/ItemShop/UserPointInfo";
import ItemUploadButton from "../components/ItemShop/ItemUploadButton";
import "../styles/itemshop.css";

const ItemShopPage = () => {
  const dispatch = useDispatch();
  const { itemList } = useSelector((state) => state.item);
  const { userInfo } = useSelector((state) => state.user);

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
