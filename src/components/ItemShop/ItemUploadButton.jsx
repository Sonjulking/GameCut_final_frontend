import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadItem, fetchItems } from "../../store/itemSlice";
import { fetchUser } from "../../store/userSlice";

const ItemUploadButton = ({ userInfo }) => {
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [file, setFile] = useState(null);

  const dispatch = useDispatch();

  // 업로드 제출
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

    // 업로드 액션 dispatch
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
      <button onClick={() => setShowModal(true)}>업로드</button>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "#fff",
            border: "1px solid #ddd",
            padding: 24,
            borderRadius: 8,
            zIndex: 999,
          }}
        >
          <form onSubmit={handleSubmit}>
            <div>
              <label>아이템 이름: </label>
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>가격(P): </label>
              <input
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                required
                min={1}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="submit">업로드</button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ marginLeft: 8 }}
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
