import { useNavigate } from "react-router-dom";

const SideNav = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="fixed left-0 top-0 bottom-0 w-40 text-black p-4 space-y-4 bg-white" >
            <button onClick={() => navigate('/chat')} className="block w-full text-left hover:bg-yellow-400 p-2 rounded">Chat</button>
            <button onClick={() => navigate('/profile')} className="block w-full text-left hover:bg-yellow-400 p-2 rounded">Profile</button>
            <button onClick={handleLogout} className="block w-full text-left hover:bg-red-500 p-2 rounded">Logga ut</button>
        </div>
    )
};

export default SideNav;