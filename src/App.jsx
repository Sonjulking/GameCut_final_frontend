// src/App.jsx
import React from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes.jsx";
import {ApiContext} from "./context/ApiContext.js";

function App() {

    return (

            <AppRoutes/>
    );
}

export default App;
