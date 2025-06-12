// /components/BoardWrite/PhotoUploader.jsx
import React from "react";
import {Box, Button, Typography, IconButton, Stack} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const PhotoUploader = ({photoFiles, setPhotoFiles}) => {
    const handlePhotoFilesChange = (e) => {
        const files = Array.from(e.target.files).filter(f => f.size <= MAX_FILE_SIZE);
        if (files.length !== e.target.files.length) alert("50MB 이하의 이미지만 허용됩니다.");
        setPhotoFiles(prev => [...prev, ...files]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE);
        if (files.length === 0) {
            alert("이미지 파일만 드래그해주세요. (50MB 이하)");
            return;
        }
        setPhotoFiles(prev => [...prev, ...files]);
    };

    const removePhoto = (idx) => {
        const newFiles = [...photoFiles];
        newFiles.splice(idx, 1);
        setPhotoFiles(newFiles);
    };

    return (
            <Box
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
            >
                <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon/>}
                >
                    이미지 업로드 (또는 드래그)
                    <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handlePhotoFilesChange}
                    />
                </Button>
                <Stack
                        direction="row"
                        spacing={2}
                        flexWrap="wrap"
                >
                    {photoFiles.map((file, idx) => (
                            <Box
                                    key={idx}
                                    sx={{position: "relative"}}
                            >
                                <Typography
                                        color="gray"
                                        variant="caption"
                                >{file.name}</Typography>
                                <img
                                        src={URL.createObjectURL(file)}
                                        alt="img"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: 6
                                        }}
                                />
                                <IconButton
                                        size="small"
                                        onClick={() => removePhoto(idx)}
                                        sx={{position: "absolute", top: 0, right: 0}}
                                >
                                    <DeleteIcon
                                            fontSize="small"
                                            sx={{color: "red"}}
                                    />
                                </IconButton>
                            </Box>
                    ))}
                </Stack>
            </Box>
    );
};

export default PhotoUploader;