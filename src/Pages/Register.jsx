import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Link } from "react-router-dom";

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: ''});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });

    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess("");

        try{
            //hämta token
            const csrfRes = await axios.patch('https://chatify-api.up.railway.app/csrf', {}, { withCredentials: true });
            const csrfToken = csrfRes.data.csrfToken;

            //skicka reegister anrop
            await axios.post('https://chatify-api.up.railway.app/auth/register',
        {
            username: form.username,
            email: form.email,
            password: form.password,
            avatar: `https://i.pravatar.cc/150?u=${form.username}`,
            csrfToken: csrfToken,
            
        },
    { 
        withCredentials: true,                   
      }
    );

        setSuccess("Registrering lyckades! Du skickas vidare...");
        setTimeout(() => navigate("/login"), 1500);
    }catch (err) {
        setError(err.response?.data?.error || "Registrering misslyckades");
    }};


    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{
          backgroundImage: "url('/bakgrund.jpg')",}}>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color:"#5A314E"}}>Registrera</h2>

            <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-sm">
                <input type="text" name="username" placeholder="Användarnamn" onChange={handleChange} required className="w-full p-3 mb-3 border rounded focus-outline-one focus:ring-1 focus:ring-blue-500" />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 mb-3 border rounded focus-outline-one focus:ring-1 focus:ring-blue-500"/>
                <input type="password" name="password" placeholder="Lösenord" onChange={handleChange} required className="w-full p-3 mb-3 border rounded focus-outline-one focus:ring-1 focus:ring-blue-500"/>
                <button type="submit" className="w-full text-white font-semibold py-2 mt-6 rounded-lg" style={{ backgroundColor: "#5A314E" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5066C7")}
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#5A314E")}>Registrera</button>
        </form>

        <p className="text-center mt-4">
          Har du redan konto?{" "} <Link to="/login" className="text-blue-600 hover:text-blue-900">
          Logga in här
          </Link>
        </p>

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
    </div>
    </div>
)
};

export default Register;