import React, {useEffect, useRef, useState} from "react";
import {
    Autocomplete,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Chip, Box, Button,
} from "@mui/material";
import {Editor} from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../../styles/toast-editor-dark.css";
import axios from "axios"; // 이미지 업로드에 필요

const FormInputGroup = ({form, handleChange, isEdit}) => {
    const editorRef = useRef(null);
    // 태그 입력 상태
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [tagLoading, setTagLoading] = useState(false);
    useEffect(() => {
        if (Array.isArray(form.videoTags)) {
            const incoming = form.videoTags;
            const current = tags;

            // 배열이 같으면 setTags 하지 않음
            const isSame = incoming.length === current.length &&
                    incoming.every((tag, i) => tag === current[i]);

            if (!isSame) {
                setTags(incoming);
            }
        } else if (typeof form.videoTags === "string") {
            const parsed = form.videoTags.trim() === "" ? [] : form.videoTags.trim().split(/\s+/);
            const isSame = parsed.length === tags.length &&
                    parsed.every((tag, i) => tag === tags[i]);
            if (!isSame) {
                setTags(parsed);
            }
        }
    }, [form.videoTags]);


    useEffect(() => {
        console.log(tags);
    }, []);


    useEffect(() => {
        handleChange({
            target: {
                name: "videoTags",
                value: tags,
            },
        });
    }, [tags]);


    const handleTagKeyDown = (e) => {
        // IME 조합 중(isComposing)이면 무시
        if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
            e.preventDefault();
            const raw = e.target.value.trim();
            if (!raw) return;

            const formatted = raw.startsWith("#") ? raw : `#${raw}`;
            if (!tags.includes(formatted)) setTags((prev) => [...prev, formatted]);
            setTagInput("");
            e.target.value = "";         // 입력 DOM도 즉시 비워 줌
        }
    };


    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    useEffect(() => {
        if (form.boardTypeNo === 3 && !isEdit) {
            handleChange({
                target: {name: "boardContent", value: ""},
            });
        }
    }, [form.boardTypeNo]);

    useEffect(() => {
        if (!editorRef.current) return;

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
                requestAnimationFrame(() => {
                    const instance = editorRef.current.getInstance();
                    instance.setHTML(form.boardContent || ""); // 여기에서 form.boardContent를 확실히 반영
                    instance.changeMode("wysiwyg", true);
                });
            }
        }

    }, [form.boardTypeNo, isEdit, form.boardContent]);

    const aiTagRecommended = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        setTagLoading(true); // 버튼 비활성화

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/tag`, null, {
                params: {
                    title: form.boardTitle,
                    content: form.boardContent,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const recommendedTags = res.data;

            if (Array.isArray(recommendedTags)) {
                const formatted = recommendedTags.map(tag =>
                        tag.startsWith("#") ? tag : `#${tag}`
                );
                const merged = [...new Set([...tags, ...formatted])];
                setTags(merged);
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
    }, [form.boardTitle, form.boardContent]);
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
                            disabled={isEdit}
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
                        <>
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
                            <Box sx={{display: "flex", gap: 1, alignItems: "center", mt: 2}}>
                                <TextField
                                        label="태그 입력"
                                        placeholder="태그 입력 후 Enter를 눌러주세요."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        InputLabelProps={{style: {color: "#ccc"}}}
                                        sx={{
                                            input: {color: "#fff"},
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {borderColor: "#555"},
                                                "&:hover fieldset": {borderColor: "#999"},
                                                "&.Mui-focused fieldset": {borderColor: "#1976d2"},
                                            },
                                            flex: 1,
                                        }}
                                />
                                <Button
                                        variant="outlined"
                                        onClick={aiTagRecommended}
                                        disabled={tagLoading}
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


                            <Box sx={{mt: 1, display: "flex", flexWrap: "wrap", gap: 1}}>
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
                                                        "&:hover": {color: "#fff"},
                                                    },
                                                }}
                                        />
                                ))}
                            </Box>
                        </>
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
