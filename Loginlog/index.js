import React, { useState, useEffect } from "react";
import axios from "axios";

function FetchAndDisplayLoginLog() {
    const [loginLogs, setLoginLogs] = useState([]);

    useEffect(() => {
        const fetchLoginLogs = async () => {
            try {
                const response = await axios.get("http://localhost:1337/api/login-logs");
                const loginLogsData = response.data.data; // Lấy mảng dữ liệu login từ trường "data"
                loginLogsData.sort((a, b) => new Date(b.attributes.loginTime) - new Date(a.attributes.loginTime)); // Lấy mảng dữ liệu login từ trường "data"
                setLoginLogs(loginLogsData); // Lưu trữ mảng dữ liệu vào state
            } catch (error) {
                console.error(error);
            }
        };

        fetchLoginLogs();
    }, []);

    return (
        <div>
            <h1>Login Logs</h1>
            <ul>
                {loginLogs.map((log) => (
                    <li key={log.id}>
                        Username: {log.attributes.username}, Login Time: {log.attributes.loginTime}, Login Status: {log.attributes.loginStatus ? 'True' : 'False'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FetchAndDisplayLoginLog;
