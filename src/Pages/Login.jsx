import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({ username: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({...form, [e.target.name]: e.target.value});

    }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    
    const csrfRes = await axios.patch(
      "https://chatify-api.up.railway.app/csrf",
      {},
      { withCredentials: true }
    );
    const csrfToken = csrfRes.data.csrfToken;

    const loginRes = await axios.post(
      "https://chatify-api.up.railway.app/auth/token",
      {
        username: form.username,
        password: form.password,
        csrfToken: csrfToken,
      },
      {
        withCredentials: true,              
      }
    );

    const token = loginRes.data.token;
    const decoded = jwtDecode(token);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
          id: decoded.id,
          username: decoded.user,
          avatar:
            decoded.avatar || `https://i.pravatar.cc/150?u=${decoded.id}`,
        }));
        window.dispatchEvent(new Event("storage"));
    navigate("/chat");

  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    setError(err.response?.data?.error || "Inloggningen misslyckades");
  }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{
          backgroundImage: "url('/bakgrund.jpg')",}}>

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-blue-100">          
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color:"#5A314E"}}>Logga in</h2>

        <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-sm">
            <input type="text" name="username" placeholder="Användarnamn" onChange={handleChange} required className="w-full p-3 border focus:outline-none focus:ring-1 focus:ring-blue-500 "/>
            <input type="password" name="password" placeholder="Lösenord" onChange={handleChange} required className="w-full p-3 border focus:outline-none focus:ring-1 focus:ring-blue-500 mt-6 "/>
            <button type="submit" className="w-full text-white font-semibold py-2 mt-10 rounded-lg transition" style={{ backgroundColor: "#5A314E" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5066C7")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#5A314E")}>Logga in</button>
        </form>

        <p className="text-center mt-4">
          Har du inget konto?{" "} <Link to="/register" className="text-blue-600 hover:text-blue-900">
          Registrera dig här
          </Link>
        </p>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
       </div>
       </div>
)
};

export default Login;