import React from "react";
import ItemCard from "./ItemCard";

const ItemList = ({ itemList, userInfo }) => {
  if (!Array.isArray(itemList)) return <div>텅 텅!</div>;

  if (itemList.length === 0) return <div>아이템이 없습니다.</div>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {itemList.map((item) => (
        <ItemCard key={item.itemNo} item={item} userInfo={userInfo} />
      ))}
    </div>
  );
};

export default ItemList;
