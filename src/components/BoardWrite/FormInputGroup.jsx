// /components/BoardWrite/FormInputGroup.jsx
import React, {useRef} from "react";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {Editor} from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../../styles/toast-editor-dark.css";

const FormInputGroup = ({form, handleChange}) => {
    const editorRef = useRef();
    return (
            <>
                <FormControl
                        fullWidth
                        sx={{mb: 3}}
                >
                    <InputLabel sx={{color: "#ccc"}}>게시판 타입</InputLabel>
                    <Select
                            name="boardTypeNo"
                            value={form.boardTypeNo}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                color: "#fff",
                                backgroundColor: "#2b2b2b",
                                "& .MuiOutlinedInput-notchedOutline": {borderColor: "#555"},
                                "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "#999"},
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "#1976d2"}
                            }}
                    >
                        <MenuItem value={1}>자유 게시판</MenuItem>
                        <MenuItem value={2}>공략 게시판</MenuItem>
                        <MenuItem value={3}>영상 게시판</MenuItem>
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

                {form.boardTypeNo === 3 ? <TextField
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
                        /> :
                        <div style={{marginTop: "24px"}}>
                            <Editor
                                    ref={editorRef}
                                    initialValue={
                                        form.boardContent?.includes("<") ? form.boardContent : ""
                                    }
                                    previewStyle="vertical"
                                    hideModeSwitch={true} // ✅ 요거 추가해줘야 마크다운 탭이 사라짐!
                                    initialEditType="wysiwyg"
                                    useCommandShortcut={true}
                                    onChange={() => {
                                        const data = editorRef.current.getInstance().getHTML();
                                        handleChange({target: {name: "boardContent", value: data}});
                                    }}
                                    theme="dark" // 유지하되, 실제 CSS는 아래 스타일로 수동 설정
                                    style={{
                                        backgroundColor: "#2b2b2b",
                                        color: "#fff",
                                        borderRadius: "4px",
                                        border: "1px solid #555",
                                        padding: "8px",
                                    }}
                                    toolbarItems={[
                                        ["heading", "bold", "italic", "strike"],
                                        ["hr", "quote"],
                                        ["ul", "ol", "task"],
                                        ["table", "link"],
                                        ["code", "codeblock"],
                                    ]}
                            />
                        </div>
                }

            </>
    );
};
export default FormInputGroup;