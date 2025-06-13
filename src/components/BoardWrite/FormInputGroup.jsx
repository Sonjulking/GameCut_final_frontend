// /components/BoardWrite/FormInputGroup.jsx
import React from "react";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";

const FormInputGroup = ({form, handleChange}) => (
        <>
            <FormControl fullWidth sx={{mb: 3}}>
                <InputLabel sx={{color: "#ccc"}}>게시판 타입</InputLabel>
                <Select
                        name="boardTypeNo"
                        value={form.boardTypeNo}
                        onChange={handleChange}
                        sx={{
                            color: "#fff",
                            backgroundColor: "#2b2b2b",
                            "& .MuiOutlinedInput-notchedOutline": {borderColor: "#555"},
                            "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "#999"},
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "#1976d2"}
                        }}
                >
                    <MenuItem value={1}>자유게시판</MenuItem>
                    <MenuItem value={2}>공지사항</MenuItem>
                    <MenuItem value={3}>유저영상</MenuItem>
                </Select>
            </FormControl>

            <TextField
                    name="boardTitle"
                    label="제목"
                    value={form.boardTitle}
                    onChange={handleChange}
                    required
                    InputLabelProps={{style: {color: "#ccc"}}}
                    sx={{
                        input: {color: "#fff"},
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {borderColor: "#555"},
                            "&:hover fieldset": {borderColor: "#999"},
                            "&.Mui-focused fieldset": {borderColor: "#1976d2"}
                        }
                    }}
            />

            <TextField
                    name="boardContent"
                    label="내용"
                    multiline
                    rows={4}
                    value={form.boardContent}
                    onChange={handleChange}
                    required
                    InputLabelProps={{style: {color: "#ccc"}}}
                    sx={{
                        textarea: {color: "#fff"},
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {borderColor: "#555"},
                            "&:hover fieldset": {borderColor: "#999"},
                            "&.Mui-focused fieldset": {borderColor: "#1976d2"}
                        }
                    }}
            />
        </>
);

export default FormInputGroup;