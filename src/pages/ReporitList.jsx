import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";

const ReportList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get("/api/report/admin/list");
        setReports(res.data);
      } catch (err) {
        alert("접근권한이 없습니다.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  const handleUserDelete = async (userNo) => {
    if (!window.confirm("정말 이 유저를 탈퇴 처리하시겠습니까?")) return;

    try {
      await axiosInstance.post(`/admin/user/delete/${userNo}`);
      alert("유저가 탈퇴 처리되었습니다.");
      setReports((prev) =>
        prev.map((r) =>
          r.userNo === userNo ? { ...r, userDeleteDate: new Date() } : r
        )
      );
    } catch (err) {
      console.error("유저 탈퇴 실패", err);
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#121212", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
        신고 목록
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "#fff" }} />
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: "#1e1e1e" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#ccc" }}>#</TableCell>
                <TableCell sx={{ color: "#ccc" }}>게시글 제목</TableCell>
                <TableCell sx={{ color: "#ccc" }}>신고자</TableCell>
                <TableCell sx={{ color: "#ccc" }}>신고 사유</TableCell>
                <TableCell sx={{ color: "#ccc" }}>신고 일자</TableCell>
                <TableCell sx={{ color: "#ccc" }}>유저 탈퇴</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportNo}>
                  <TableCell sx={{ color: "#fff" }}>
                    {report.reportNo}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#58a6ff",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => navigate(`/board/detail/${report.boardNo}`)}
                  >
                    {report.boardTitle}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {report.userNickname}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {report.reportContent}
                  </TableCell>
                  <TableCell sx={{ color: "#aaa" }}>
                    {new Date(report.reportDate).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {report.userDeleteDate !== null &&
                    report.userDeleteDate !== undefined ? (
                      <Button
                        variant="contained" // ✅ 수정: outlined → contained
                        color="success"
                        size="small"
                        //disabled
                        sx={{
                          opacity: 0.8,
                          fontWeight: "bold",
                          color: "#fff", // 텍스트 흰색
                        }}
                      >
                        탈퇴 처리 완료
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleUserDelete(report.userNo)}
                      >
                        탈퇴
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ color: "#888", textAlign: "center" }}
                  >
                    신고된 항목이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReportList;
