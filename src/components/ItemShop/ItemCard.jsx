import React from "react";

const ItemCard = ({ item, userInfo }) => {
  // 구매 버튼 클릭시 로직 (API 연동 등)
  const handleBuy = () => {
    // 구현 필요
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 16,
        width: 200,
      }}
    >
      <img
        src={item.itemImage?.fileUrl}
        alt={item.itemName}
        style={{
          width: "100%",
          height: 120,
          objectFit: "cover",
          marginBottom: 8,
        }}
      />
      <div>
        <strong>{item.itemName}</strong>
      </div>
      <div>가격: {item.itemPrice}P</div>
      <button
        onClick={handleBuy}
        disabled={userInfo.userPoint < item.itemPrice}
        style={{ marginTop: 8 }}
      >
        구매
      </button>
    </div>
  );
};

export default ItemCard;
