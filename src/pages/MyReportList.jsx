import React, { useEffect, useState } from "react";
import axios from "../lib/axiosInstance";
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
} from "@mui/material";

const MyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/report/my")
      .then((res) => {
        setReports(res.data);
      })
      .catch((err) => {
        console.error("신고 내역 불러오기 실패", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "24px",
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
        내가 신고한 내역
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#1e1e1e",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#90caf9", fontWeight: "bold" }}>
                신고번호
              </TableCell>
              <TableCell sx={{ color: "#90caf9", fontWeight: "bold" }}>
                게시글 제목
              </TableCell>
              <TableCell sx={{ color: "#90caf9", fontWeight: "bold" }}>
                신고유형
              </TableCell>
              <TableCell sx={{ color: "#90caf9", fontWeight: "bold" }}>
                내용
              </TableCell>
              <TableCell sx={{ color: "#90caf9", fontWeight: "bold" }}>
                신고일자
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.reportNo}
                sx={{
                  "&:hover": {
                    backgroundColor: "#2c2c2c",
                  },
                }}
              >
                <TableCell sx={{ color: "#fff" }}>{report.reportNo}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {report.boardTitle}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {report.reportType}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {report.reportContent}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {new Date(report.reportDate).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyReportList;
