import SideNav from '../components/SideNav';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');


  if (!user || !token) {
    window.location.href = "/login";
    return null;
  }
  // Hämta alla messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        'https://chatify-api.up.railway.app/messages',
        {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
        }
      );
      console.log("Fetched messages:", res.data);
      setMessages(res.data);
    } catch (err) {
      console.error('Fel vid hämtning av meddelande:', err);
    }
  };

  // Skapa nytt meddelande
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const csrfRes = await axios.patch(
        'https://chatify-api.up.railway.app/csrf',
        {},
        { withCredentials: true }
      );
      const csrfToken = csrfRes.data.csrfToken;

      await axios.post(
        'https://chatify-api.up.railway.app/messages',
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      setText('');
      fetchMessages();
    } catch (err) {
      console.error('Fel vid skickande:', err.response?.data || err);
    }
  };

  // Radera ett meddelande
  const deleteMessage = async (id) => {
    try {
      const csrfRes = await axios.patch(
        'https://chatify-api.up.railway.app/csrf',
        {},
        { withCredentials: true }
      );
      const csrfToken = csrfRes.data.csrfToken;

      await axios.delete(
        `https://chatify-api.up.railway.app/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      fetchMessages();
    } catch (err) {
      console.error('Fel vid radering:', err.response?.data || err);
    }
  };

  useEffect(() => {
    if (token) {
    fetchMessages();
  } }, [token]);

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className='flex-1 ml-40 relative'>
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/bakgrund.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className='relative z-20 p-6'>
      <div className="flex items-center gap-3 mb-6 justify-center">
          <h2 className="text-3xl font-semibold text-black drop-shadow">
            Hej {user.username || ""}
          </h2>
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-4">
          {messages.map((msg) => {
            const isMine = msg.userId === user.id || msg.username === user.username;
            return (
        <div
            key={msg.id || msg.messageId}
            className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>

        {isMine && (
          <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id }`} alt="avatar" className="w-12 h-12 mb-6 rounded-full" />
        )}

        <div
            className={`p-3 rounded-lg max-w-[70%] ${
            isMine ? 'bg-white text-black' : 'bg-gray-200 text-black'
      }`}>
    
      <p className="text-sm font-semibold">{msg.user?.username || "Yas"}</p>
      <p>{msg.text || msg.content}</p>

      {isMine && (
        <button
          onClick={() => deleteMessage(msg.id || msg.messageId)}
          className="text-xs text-pink-600 hover:text-pink-400 mt-1"
        >
          🗑️ Radera
        </button>
      )}
    </div>
  </div>
)})}
</div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv ett meddelande"
            className="flex-1 border p-2 rounded bg-gray-200 text-black"
          />
          <button
            type="submit"
            className="bg-yellow-400 text-red-600 font-bold px-4 py-2 rounded hover:bg-blue-800"
          >
            Skicka
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Chat;
