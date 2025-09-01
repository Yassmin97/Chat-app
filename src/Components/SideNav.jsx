import { useNavigate } from "react-router-dom";
import { MessageCircle, User, LogOut} from "lucide-react";

const SideNav = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="fixed left-0 top-0 bottom-0 w-40 text-black p-4 space-y-4 bg-white" >
            <button onClick={() => navigate('/chat')} className="block w-full text-left hover:bg-yellow-400 p-2 rounded">
                <MessageCircle size ={15} color= "#5066C7" />
                Chat</button>

            <button onClick={() => navigate('/profile')} className="block w-full text-left hover:bg-yellow-400 p-2 rounded">
                <User size={18} color= "#5066C7" />
                Profile</button>

            <button onClick={handleLogout} className="block w-full text-left hover:bg-[#5A314E] hover:text-[#fff] p-2 rounded">
                <LogOut size={15} color= "#5066C7" />
                Logga ut</button>
        </div>
    )
};

export default SideNav;