import {Route, Routes} from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import React from "react";
import HomePage from "../pages/HomePage.jsx";
import Test from "../pages/Test.jsx";
import BoardWrite from "../pages/BoardWrite.jsx";

const AppRoutes = () => {
    //test
    return (
            <>
                <Routes>
                    <Route path="/" element={<Layout/>}>
                        <Route index element={<HomePage/>}/>
                        <Route path="/test" element={<Test/>}/>
                        <Route path="/boardWrite" element={<BoardWrite/>}/>
                    </Route>
                </Routes>
            </>
    );
};

export default AppRoutes;