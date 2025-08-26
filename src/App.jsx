import { Routes, Route, Navigate } from "react-router-dom"; 
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Chat from "./Pages/Chat";
import Profile from "./Pages/Profile";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedin, setIsLoggedin] = useState(false);

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedin(!!(token && user));
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  return (
    <Routes>
      {!isLoggedin ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/chat" />} />
        </>
      )}
    </Routes>
  );
}

export default App;
