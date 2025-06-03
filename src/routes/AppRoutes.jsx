import {Route, Routes} from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React from "react";
import HomePage from "../pages/HomePage.jsx";
import Test from "../pages/Test.jsx";

const AppRoutes = () => {
    return (
            <>
                <Routes>
                    <Route path="/" element={<Layout/>}>
                        <Route index element={<HomePage/>}/>
                        <Route path="/test" element={<Test/>}/>
                    </Route>
                </Routes>
            </>
    );
};

export default AppRoutes;