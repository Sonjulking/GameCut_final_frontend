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

const FormInputGroup = ({form, handleChange, isEdit}) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (!isEdit) {
            handleChange({
                target: {name: "boardContent", value: ""},
            });

            if (form.boardTypeNo !== 3) {
                // 에디터가 렌더링된 다음 프레임에 초기화
                requestAnimationFrame(() => {
                    if (editorRef.current) {
                        const instance = editorRef.current.getInstance();
                        instance.setHTML(form.boardContent || "");
                        instance.changeMode("wysiwyg", true);
                    }
                });
            }
        } else {
            if (form.boardTypeNo !== 3 && editorRef.current) {
                const instance = editorRef.current.getInstance();
                instance.setHTML(form.boardContent || ""); // 여기에서 form.boardContent를 확실히 반영
                instance.changeMode("wysiwyg", true);
            }
        }

    }, [form.boardTypeNo, form.boardContent]);


    return (
            <>
                <FormControl fullWidth sx={{mb: 3}}>
                    <InputLabel sx={{color: "#ccc"}}>게시판 타입</InputLabel>
                    <Select
                            name="boardTypeNo"
                            value={form.boardTypeNo}
                            onChange={handleChange}
                            variant="outlined"
                            disabled={isEdit} // ← 요거 추가!
                            sx={{
                                color: "#fff",
                                backgroundColor: "#2b2b2b",
                                "& .MuiOutlinedInput-notchedOutline": {borderColor: "#555"},
                                "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "#999"},
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1976d2",
                                },
                                "&.Mui-disabled": {
                                    color: "#aaa", // 텍스트 색상
                                    "-webkit-text-fill-color": "#aaa", // Webkit 계열 브라우저 텍스트 색상
                                    backgroundColor: "#2b2b2b", // 배경 유지
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#444", // 테두리 색상
                                    },
                                    "& .MuiSelect-select.Mui-disabled": {
                                        color: "#aaa", // 드롭다운 텍스트 색상
                                        WebkitTextFillColor: "#aaa", // 크롬에서 적용 안될 시
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#999",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#1976d2",
                                    },
                                    "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#444", // disabled일 때 테두리
                                    },
                                }
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
                                    key={form.boardTypeNo}
                                    ref={editorRef}
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
                                        ["table", "link", "image"],
                                        ["code", "codeblock"],
                                    ]}
                                    hooks={{
                                        addImageBlobHook: async (blob, callback) => {
                                            const token = localStorage.getItem("token");
                                            const formData = new FormData();
                                            formData.append("image", blob);

                                            try {
                                                const res = await axios.post(
                                                        `${import.meta.env.VITE_API_URL}/board/img`,
                                                        formData,
                                                        {
                                                            headers: {
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                        }
                                                );
                                                const imageUrl = `${import.meta.env.VITE_API_URL}${res.data.imageUrl}`;
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
