import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import "../styles/itemshop.css";

const GRID_BREAKPOINTS = [
  { min: 1200, columns: 5 },
  { min: 900, columns: 4 },
  { min: 600, columns: 3 },
  { min: 0, columns: 2 },
];

function getGridColumns() {
  const width = window.innerWidth;
  for (const bp of GRID_BREAKPOINTS) {
    if (width >= bp.min) return bp.columns;
  }
  return 2;
}

const ItemShop = () => {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [userPoint, setUserPoint] = useState(0);
  const [columns, setColumns] = useState(getGridColumns());

  // 아이템 목록 불러오기
  const loadItems = async () => {
    try {
      const res = await axiosInstance.get("/itemshop/items");
      setItems(res.data);
    } catch (e) {
      alert("아이템 목록을 불러오지 못했습니다.");
    }
  };

  // 유저 정보 불러오기 (실제 API에 맞춰 경로 조정)
  const loadUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me");
      setUser(res.data);
      setUserPoint(res.data.userPoint ?? 0);
    } catch (e) {
      alert("유저 정보를 불러올 수 없습니다.");
      setUser(null);
      setUserPoint(0);
    }
  };

  useEffect(() => {
    loadItems();
    loadUser();

    const handleResize = () => setColumns(getGridColumns());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, []);

  // 아이템 구매
  const handleBuy = async (itemNo, itemPrice) => {
    if (userPoint < itemPrice) {
      alert("포인트 부족");
      return;
    }
    try {
      const res = await axiosInstance.post("/itemshop/buy", {
        userNo: user.userNo,
        itemNo: itemNo,
      });
      setUser(res.data); // userDTO 전체를 리턴받으면 setUser
      setUserPoint(res.data.userPoint ?? 0);
      alert("구매 성공!");
    } catch (err) {
      alert(
        err.response?.data?.message || "구매 실패: " + err.response?.data || ""
      );
    }
  };

  // 아이템 업로드 (ROLE_USER, ROLE_ADMIN 모두 가능)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const itemName = prompt("아이템 이름을 입력하세요") || "";
    const itemPrice = prompt("아이템 가격을 입력하세요") || "";
    if (!itemName || !itemPrice) {
      alert("이름과 가격을 모두 입력해야 합니다.");
      return;
    }
    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("itemPrice", itemPrice);
    formData.append("file", file);

    try {
      await axiosInstance.post("/itemshop/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("업로드 성공!");
      loadItems();
    } catch (err) {
      alert("업로드 실패: " + err.response?.data || "");
    }
  };

  // 반응형 그리드 스타일
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "18px",
    marginTop: "28px",
  };

  // user 정보가 아직 오지 않았다면 로딩 표시
  if (!user) {
    return (
      <div style={{ padding: "50px 0", textAlign: "center" }}>
        유저 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="itemshop-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          {user.userName} 포인트:{" "}
          <span style={{ color: "#007aff" }}>{userPoint}</span>
        </span>
        {/* ROLE_USER, ROLE_ADMIN 모두 업로드 가능 */}
        {["ROLE_USER", "ROLE_ADMIN"].includes(user.role) && (
          <label style={{ cursor: "pointer", fontWeight: 500 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
            <span
              style={{
                background: "#2d81f7",
                color: "#fff",
                borderRadius: 5,
                padding: "6px 18px",
                fontSize: "1rem",
              }}
            >
              업로드
            </span>
          </label>
        )}
      </div>

      <div style={gridStyle}>
        {items.map((item) => (
          <div
            key={item.itemNo}
            className="itemshop-card"
            style={{
              border: "1px solid #232323",
              borderRadius: 12,
              padding: 16,
              background: "#232323",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.itemName}
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {item.itemName}
            </div>
            <div style={{ color: "#84b0ff", margin: "7px 0" }}>
              가격: {item.itemPrice}P
            </div>
            <button
              onClick={() => handleBuy(item.itemNo, item.itemPrice)}
              disabled={userPoint < item.itemPrice}
              style={{
                marginTop: 6,
                width: "100%",
                borderRadius: 6,
                background: userPoint < item.itemPrice ? "#888" : "#2d81f7",
                color: "#fff",
                border: "none",
                padding: "8px 0",
                fontWeight: 600,
                cursor: userPoint < item.itemPrice ? "not-allowed" : "pointer",
              }}
            >
              {userPoint < item.itemPrice ? "포인트 부족" : "구매"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemShop;
