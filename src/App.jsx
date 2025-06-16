// src/App.jsx
import React from "react";
import "./App.css";
import router from "./routes/AppRoutes.jsx";
import {RouterProvider} from "react-router-dom";

function App() {

    return (
            <RouterProvider router={router} />
    );
}

export default App;
