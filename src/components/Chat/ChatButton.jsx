import React from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const ChatButton = ({ onClick }) => {
    return (
            <Fab
                    onClick={onClick}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        bgcolor: '#2a2a2a',
                        color: '#ffffff',
                        '&:hover': {
                            bgcolor: '#444',
                        },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
            >
                <ChatIcon />
            </Fab>
    );
};

export default ChatButton;
