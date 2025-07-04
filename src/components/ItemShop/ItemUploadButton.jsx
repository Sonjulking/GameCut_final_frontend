import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadItem, fetchItems } from "../../store/itemSlice";
import { fetchUser } from "../../store/userSlice";
import "../../styles/itemshop.css"; // Assuming you have a CSS file for styles

const ItemUploadButton = ({ userInfo }) => {
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [file, setFile] = useState(null);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !file) {
      alert("모든 정보를 입력해 주세요!");
      return;
    }

    const itemDTO = {
      itemName,
      itemPrice: Number(itemPrice),
      itemDeleteDate: null,
      itemImage: null,
    };

    await dispatch(uploadItem({ itemDTO, file }));
    await dispatch(fetchItems());
    await dispatch(fetchUser());
    setShowModal(false);
    setItemName("");
    setItemPrice("");
    setFile(null);
  };

  return (
    <>
      <button className="itemshop-button" onClick={() => setShowModal(true)}>
        업로드
      </button>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            zIndex: 999,
          }}
        >
          <form onSubmit={handleSubmit} className="itemupload-modal">
            <label>아이템 이름</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />

            <label>가격(P)</label>
            <input
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              required
              min={1}
            />

            <label>이미지 선택</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />

            <div style={{ marginTop: "16px" }}>
              <button type="submit" className="itemshop-button">
                업로드
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="itemshop-button"
                style={{ backgroundColor: "#666", marginLeft: "10px" }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ItemUploadButton;
