import React from "react";
import ItemCard from "./ItemCard";

const ItemList = ({ itemList, userInfo }) => {
  if (!Array.isArray(itemList)) return <div>아이템이 없어요ㅠ_ㅠ</div>;

  if (itemList.length === 0) return <div>아이템이 없습니다.</div>;

  return (
    <div className="itemlist-grid">
      {itemList.map((item) => (
        <ItemCard key={item.itemNo} item={item} userInfo={userInfo} />
      ))}
    </div>
  );
};

export default ItemList;
