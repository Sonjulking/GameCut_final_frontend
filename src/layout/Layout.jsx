import React from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import {Outlet} from "react-router-dom";

const Layout = () => {
    return (
            <div className="App">
                <Header/>
                <div className="main_container">
                    <Sidebar/>
                    <div className="main_content">
                        <Outlet/>
                    </div>
                </div>
            </div>
    );
};

export default Layout;
