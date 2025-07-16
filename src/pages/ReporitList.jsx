// ReportList.jsx - 2025년 7월 16일 수정됨
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
import "../styles/reportList.css"; // CSS 파일 import 추가

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

  if (loading) {
    return (
      <Box className="report-list-container">
        <div className="loading-container">
          <CircularProgress className="loading-spinner" />
        </div>
      </Box>
    );
  }

  return (
    <Box className="report-list-container">
      <Typography variant="h4" className="report-title">
        신고 목록
      </Typography>

      <div className="report-table-container">
        <div className="report-table-scroll">
          <TableContainer component={Paper}>
            <Table className="report-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>게시글 제목</TableCell>
                  <TableCell>신고자</TableCell>
                  <TableCell>신고 사유</TableCell>
                  <TableCell>신고 일자</TableCell>
                  <TableCell>유저 탈퇴</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.reportNo}>
                    <TableCell>{report.reportNo}</TableCell>
                    <TableCell>
                      <span
                        className="board-title-link"
                        onClick={() =>
                          navigate(`/board/detail/${report.boardNo}`)
                        }
                      >
                        {report.boardTitle}
                      </span>
                    </TableCell>
                    <TableCell>{report.userNickname}</TableCell>
                    <TableCell>{report.reportContent}</TableCell>
                    <TableCell>
                      {new Date(report.reportDate).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {report.userDeleteDate !== null &&
                      report.userDeleteDate !== undefined ? (
                        <Button
                          variant="contained"
                          size="small"
                          className="completed-button"
                          disabled
                        >
                          탈퇴 처리 완료
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          className="delete-button"
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
                    <TableCell colSpan={6} className="empty-message">
                      신고된 항목이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </Box>
  );
};

export default ReportList;
