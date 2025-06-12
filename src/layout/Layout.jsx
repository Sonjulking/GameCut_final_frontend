import React, {Suspense} from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import {Outlet} from "react-router-dom";
import LoadingScreen from "../components/Loading/LoadingScreen.jsx";

const Layout = () => {
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
            </div>
    );
};

export default Layout;
