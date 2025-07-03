import React from "react";
import { useDispatch } from "react-redux";
import { buyItem, fetchItems } from "../../store/itemSlice";
import { fetchUser } from "../../store/userSlice";

const ItemCard = ({ item, userInfo }) => {
  const dispatch = useDispatch();
  const canBuy = userInfo?.userPoint >= item.itemPrice;

  const handleBuy = async () => {
    try {
      const result = await dispatch(buyItem({ itemNo: item.itemNo }));

      if (buyItem.fulfilled.match(result)) {
        alert("구매 성공!");
        dispatch(fetchItems()); // 아이템 목록 재조회
        dispatch(fetchUser()); // 포인트 갱신
      } else {
        alert(result.payload || "구매 실패");
      }
    } catch (error) {
      console.error("구매 에러:", error);
      alert("구매 중 오류 발생");
    }
  };

  return (
    <div className="itemcard">
      <img
        src={`http://localhost:8081${item.itemImage?.fileUrl}`}
        alt={item.itemName}
      />
      <div>아이템명 : {item.itemName}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span>가격 : {item.itemPrice}P</span>
        <button
          className="itemshop-button"
          onClick={handleBuy}
          disabled={!canBuy}
        >
          구매
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
