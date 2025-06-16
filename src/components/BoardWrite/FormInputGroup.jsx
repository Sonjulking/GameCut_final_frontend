import React, {useEffect, useRef} from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import {Editor} from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../../styles/toast-editor-dark.css";
import axios from "axios"; // 이미지 업로드에 필요

const FormInputGroup = ({form, handleChange}) => {
    const editorRef = useRef(null);
    useEffect(() => {
        if (editorRef.current && form.boardTypeNo !== 3) {
            const instance = editorRef.current.getInstance();
            instance.setHTML(form.boardContent || ""); // 이걸 명확하게 설정
            instance.changeMode("wysiwyg", true); // 선택사항이지만 추천
        }
    }, [form.boardContent, form.boardTypeNo]);


    return (
            <>
                <FormControl fullWidth sx={{mb: 3}}>
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
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1976d2",
                                },
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
                                "&.Mui-focused fieldset": {borderColor: "#1976d2"},
                            },
                        }}
                />

                {form.boardTypeNo === 3 ? (
                        <TextField
                                name="boardContent"
                                label="내용"
                                multiline
                                rows={4}
                                value={form.boardContent?.trim() === "<p><br></p>" ? "" : form.boardContent}
                                onChange={handleChange}
                                required
                                InputLabelProps={{style: {color: "#ccc"}}}
                                sx={{
                                    textarea: {color: "#fff"},
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {borderColor: "#555"},
                                        "&:hover fieldset": {borderColor: "#999"},
                                        "&.Mui-focused fieldset": {borderColor: "#1976d2"},
                                    },
                                }}
                        />
                ) : (
                        <div style={{marginTop: "24px"}}>
                            <Editor
                                    ref={editorRef}
                                    initialValue=""
                                    previewStyle="vertical"
                                    hideModeSwitch={true}

                                    initialEditType="wysiwyg"
                                    useCommandShortcut={true}
                                    onChange={() => {
                                        const data = editorRef.current.getInstance().getHTML();
                                        handleChange({target: {name: "boardContent", value: data}});
                                    }}
                                    theme="dark"
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
                                        ["table", "link", "image"], // 이미지 버튼 활성화
                                        ["code", "codeblock"],
                                    ]}
                                    hooks={{
                                        addImageBlobHook: async (blob, callback) => {

                                            console.log("🔥 이미지 업로드 훅 실행됨", blob);
                                            const formData = new FormData();
                                            formData.append("image", blob);

                                            try {
                                                const res = await axios.post(
                                                        `${import.meta.env.VITE_API_URL}/board/img`,
                                                        formData,
                                                );

                                                console.log("url : " + res.data.imageUrl);

                                                const imageUrl = `${import.meta.env.VITE_API_URL}` + res.data.imageUrl; // 서버에서 받은 이미지 URL
                                                //에디터에서 자동으로 url 받아서 img 설정
                                                callback(imageUrl);
                                            } catch (err) {
                                                console.error("이미지 업로드 실패", err);
                                                alert("이미지 업로드에 실패했습니다.");
                                            }
                                        },
                                    }}
                            />
                        </div>
                )}
            </>
    );
};

export default FormInputGroup;
