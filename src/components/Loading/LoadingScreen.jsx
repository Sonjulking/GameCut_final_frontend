import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";

const LoadingScreen = () => {
    return (
            <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100%" // 부모 높이에 맞춰서 중앙 정렬
                    width="100%"
            >
                <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p={4}
                        color="#ffffff"
                >
                    <CircularProgress size={100} thickness={4} sx={{color: "#90caf9"}}/>
                    <Typography variant="h6" mt={2}>
                        Loading...
                    </Typography>
                </Box>
            </Box>
    );
};

export default LoadingScreen;
