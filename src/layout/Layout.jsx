import React, {Suspense, useState} from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import {Outlet} from "react-router-dom";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";
import ChatButton from "../components/Chat/ChatButton.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";

const Layout = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    return (
            <div className="App">
                <Header/>
                <div className="main_container">
                    <Sidebar/>
                    <div className="main_content">
                        <Suspense fallback={<LoadingScreen/>}>
                            <Outlet/>
                        </Suspense>
                    </div>
                </div>

                <ChatButton onClick={() => setIsChatOpen(prev => !prev)} />
                {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
            </div>
    );
};

export default Layout;
