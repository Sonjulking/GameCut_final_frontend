import {useState, useEffect} from "react";
import axios from "axios";

export function useUser() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        axios.get("/username.json").then((res) => {
            console.log("받은 데이터:", res.data); // 여기 확인
            setUsername(res.data.name);
        });
    }, []);

    return [username, setUsername];
}