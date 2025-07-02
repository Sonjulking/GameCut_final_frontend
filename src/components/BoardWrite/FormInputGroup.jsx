import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Autocomplete,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Chip, Box, Button,
} from "@mui/material";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../../styles/toast-editor-dark.css";
import axiosInstance from "../../lib/axiosInstance.js"; // 이미지 업로드에 필요

const FormInputGroup = ({ form, handleChange, isEdit }) => {
    const editorRef = useRef(null);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [tagLoading, setTagLoading] = useState(false);
    const [tagSuggested, setTagSuggested] = useState(false);

    // 무한 렌더링 방지
    const updateTags = useCallback((newTags) => {
        setTags((prevTags) => {
            const updatedTags = [...new Set([...prevTags, ...newTags])];
            return updatedTags;
        });
    }, []);

    useEffect(() => {
        if (Array.isArray(form.videoTags)) {
            const incoming = form.videoTags;
            const current = tags;

            // 배열이 같으면 setTags 하지 않음
            const isSame = incoming.length === current.length &&
                    incoming.every((tag, i) => tag === current[i]);

            if (!isSame) {
                updateTags(incoming);
            }
        } else if (typeof form.videoTags === "string") {
            const parsed = form.videoTags.trim() === "" ? [] : form.videoTags.trim().split(/\s+/);
            const isSame = parsed.length === tags.length &&
                    parsed.every((tag, i) => tag === tags[i]);
            if (!isSame) {
                updateTags(parsed);
            }
        }
    }, [form.videoTags, updateTags]); // tags 의존성 제거

    const handleTagKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
            e.preventDefault();
            const raw = e.target.value.trim();
            if (!raw) return;

            const formatted = raw.startsWith("#") ? raw : `#${raw}`;
            if (!tags.includes(formatted)) {
                updateTags([formatted]);
            }
            setTagInput("");
            e.target.value = "";  // 입력 DOM도 즉시 비워 줌
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    useEffect(() => {
        if (form.boardTypeNo === 3 && !isEdit) {
            handleChange({
                target: { name: "boardContent", value: "" },
            });
        }
    }, [form.boardTypeNo]);

    // 에디터 내용 변경 후 부모로 전달
    const handleEditorBlur = () => {
        const instance = editorRef.current.getInstance();
        const html = instance.getHTML();

        // 부모 컴포넌트로 content 업데이트
        if (html !== form.boardContent) {
            handleChange({
                target: { name: "boardContent", value: html },
            });
        }
    };

    // 에디터 초기화를 위한 별도 useEffect
    useEffect(() => {
        if (!editorRef.current || form.boardTypeNo === 3) return;

        const instance = editorRef.current.getInstance();
        
        if (isEdit) {
            // 수정 모드일 때만 form.boardContent가 변경되면 업데이트
            instance.setHTML(form.boardContent || "");
            instance.changeMode("wysiwyg", true);
        }
    }, [isEdit, form.boardContent]); // 수정 모드에서만 boardContent 의존성 적용

    // 게시판 타입 변경을 위한 별도 useEffect  
    useEffect(() => {
        if (!editorRef.current || form.boardTypeNo === 3) return;

        if (!isEdit) {
            // 새 글 작성 시 게시판 타입이 변경되면 초기화
            handleChange({
                target: {name: "boardContent", value: ""},
            });
            
            requestAnimationFrame(() => {
                if (editorRef.current) {
                    const instance = editorRef.current.getInstance();
                    instance.setHTML("");
                    instance.changeMode("wysiwyg", true);
                }
            });
        }
    }, [form.boardTypeNo]); // 게시판 타입 변경시만

    const aiTagRecommended = async () => {
        setTagLoading(true);

        try {
            const res = await axiosInstance.post(
                    "/ai/tag",
                    {},
                    {
                        params: {
                            title: form.boardTitle,
                            content: form.boardContent,
                        },
                    }
            );

            const recommendedTags = res.data;

            if (Array.isArray(recommendedTags)) {
                const formatted = recommendedTags.map(tag =>
                        tag.startsWith("#") ? tag : `#${tag}`
                );
                updateTags(formatted);
                setTagSuggested(true);
            } else {
                alert("추천 결과가 배열 형식이 아닙니다.");
            }
        } catch (err) {
            console.error("태그 추천 실패:", err);
            alert("태그 추천 요청에 실패했습니다.");
        } finally {
            setTagLoading(false); // 완료 후 재활성화
        }
    };

    useEffect(() => {
        setTags([]);        // 태그 초기화
        setTagLoading(false); // 버튼 다시 활성화
        setTagSuggested(false); // 버튼 다시활성화
    }, [form.boardTitle, form.boardContent]);

    const isTagButtonDisabled = () => {
        const titleEmpty = !form.boardTitle || form.boardTitle.trim() === "";
        const contentEmpty = !form.boardContent || form.boardContent.trim() === "";
        return tagLoading || tagSuggested || titleEmpty || contentEmpty;
    };

    return (
            <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: "#ccc" }}>게시판 타입</InputLabel>
                    <Select
                            name="boardTypeNo"
                            value={form.boardTypeNo}
                            onChange={handleChange}
                            variant="outlined"
                            disabled={isEdit}
                            sx={{
                                color: "#fff",
                                backgroundColor: "#2b2b2b",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#999" },
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
                        fullWidth
                        sx={{
                            mb: 3,
                            input: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#555" },
                                "&:hover fieldset": { borderColor: "#999" },
                                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                            },
                        }}
                        InputLabelProps={{ style: { color: "#ccc" } }}
                />

                {form.boardTypeNo === 3 ? (
                        <>
                            <TextField
                                    name="boardContent"
                                    label="내용"
                                    multiline
                                    rows={4}
                                    value={form.boardContent?.trim() === "<p><br></p>" ? "" : form.boardContent}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ style: { color: "#ccc" } }}
                                    sx={{
                                        textarea: { color: "#fff" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "#555" },
                                            "&:hover fieldset": { borderColor: "#999" },
                                            "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                                        },
                                    }}
                            />
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
                                <TextField
                                        label="태그 입력"
                                        placeholder="태그 입력 후 Enter를 눌러주세요."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        InputLabelProps={{ style: { color: "#ccc" } }}
                                        sx={{
                                            input: { color: "#fff" },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": { borderColor: "#555" },
                                                "&:hover fieldset": { borderColor: "#999" },
                                                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                                            },
                                            flex: 1,
                                        }}
                                />
                                <Button
                                        variant="outlined"
                                        onClick={aiTagRecommended}
                                        disabled={isTagButtonDisabled()}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            minHeight: "3.25rem",
                                            fontSize: "0.875rem",
                                            color: "#fff",
                                            borderColor: "#888",
                                            backgroundColor: "#444",
                                            lineHeight: 1.2,
                                            "&:hover": {
                                                backgroundColor: "#555",
                                                borderColor: "#aaa",
                                            },
                                        }}
                                >
                                    {tagLoading ? "추천 중..." : "태그 추천"}
                                </Button>
                            </Box>

                            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {tags.map((tag, index) => (
                                        <Chip
                                                key={index}
                                                label={tag}
                                                onDelete={() => setTags((prev) => prev.filter((t) => t !== tag))}
                                                sx={{
                                                    bgcolor: "#444",
                                                    color: "#fff",
                                                    border: "1px solid #888",
                                                    "& .MuiChip-deleteIcon": {
                                                        color: "#ccc",
                                                        "&:hover": { color: "#fff" },
                                                    },
                                                }}
                                        />
                                ))}
                            </Box>
                        </>
                ) : (
                        <div style={{ marginTop: "24px" }}>
                            <Editor
                                    ref={editorRef}
                                    previewStyle="vertical"
                                    hideModeSwitch={true}
                                    initialEditType="wysiwyg"
                                    useCommandShortcut={true}
                                    onBlur={handleEditorBlur} // 에디터 내용 변경 후 onBlur 이벤트로 부모로 전달
                                    theme="dark"
                                    style={{
                                        backgroundColor: "#2b2b2b",
                                        color: "#fff",
                                        borderRadius: "4px",
                                        border: "1px solid #555",
                                        padding: "8px",
                                    }}
                                    initialValue={form.boardContent || ""} // 초기 내용 설정
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
                                                const res = await axiosInstance.post(
                                                        `${import.meta.env.VITE_API_URL}/board/img`,
                                                        formData,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
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
