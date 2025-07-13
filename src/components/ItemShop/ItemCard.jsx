// 2025-07-10 생성됨
import React from "react";
import { useDispatch } from "react-redux";
import { buyItem, deleteItem, fetchItems } from "../../store/itemSlice";
import { fetchUser } from "../../store/userSlice";

// 환경에 따른 이미지 URL 처리
const getImageUrl = (fileUrl) => {
  if (!fileUrl) return '';
  
  // 이미 전체 URL인 경우
  if (fileUrl.startsWith('http')) return fileUrl;
  
  // 현재 환경에 따라 URL 구성
  if (window.location.port === '' || window.location.port === '80') {
    // nginx 환경
    return `/api${fileUrl}`;
  } else {
    // 개발 환경
    return `http://localhost:8081${fileUrl}`;
  }
};

const ItemCard = ({ item, userInfo }) => {
  const dispatch = useDispatch();
  const canBuy = userInfo?.userPoint >= item.itemPrice;

  const handleBuy = async () => {
    try {
      const result = await dispatch(buyItem({ itemNo: item.itemNo }));

      if (buyItem.fulfilled.match(result)) {
        alert("구매 성공!");
        dispatch(fetchItems());
        dispatch(fetchUser());
      } else {
        alert(result.payload || "구매 실패");
      }
    } catch (error) {
      console.error("구매 에러:", error);
      alert("구매 중 오류 발생");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const result = await dispatch(deleteItem(item.itemNo));
      if (deleteItem.fulfilled.match(result)) {
        alert("삭제 성공!");
        dispatch(fetchItems());
      } else {
        alert(result.payload || "삭제 실패");
      }
    } catch (error) {
      alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="itemcard">
      <img
        src={getImageUrl(item.itemImage?.fileUrl)}
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="itemshop-button"
            onClick={handleBuy}
            disabled={!canBuy}
          >
            구매
          </button>
          {userInfo?.role === "ROLE_ADMIN" && (
            <button
              className="itemshop-button"
              onClick={handleDelete}
              style={{ backgroundColor: "#d9534f" }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
