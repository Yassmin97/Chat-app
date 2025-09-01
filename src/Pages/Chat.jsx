import SideNav from '../Components/SideNav';
import React, { useEffect, useState, useRef, cache } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);

  if (!user || !token) {
    window.location.href = "/login";
    return null;
  }
  // Hämta alla meddelande
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        'https://chatify-api.up.railway.app/messages',
        {
          headers: { Authorization: `Bearer ${token}` },
        });
      
      setMessages(res.data);
      localStorage.setItem("messages", JSON.stringify(res.data));
    } catch (err) {
      console.error('Fel vid hämtning av meddelande:', err);
    }
  };

  // skicka nytt meddelande
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const csrfRes = await axios.patch(
      "https://chatify-api.up.railway.app/csrf",
      {},
      { withCredentials: true }
    );
    const csrfToken = csrfRes.data.csrfToken;

     const response = await axios.post(
        'https://chatify-api.up.railway.app/messages',
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`},            
        });

    const savedMessage = response.data;
    setMessages((prev) => {
      const updated = [...prev, savedMessage];
      localStorage.setItem("messages", JSON.stringify(updated));
      return updated;
    });

      setText('');
      botReply();
    } catch (err) {
      console.error('Fel vid skickande:', err.response?.data || err);
    }
  };

  // Radera ett meddelande
  const deleteMessage = async (id) => {
    try {
      await axios.delete(
        `https://chatify-api.up.railway.app/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, },
        });

      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      localStorage.setItem("messages", JSON.stringify(updated));
     
    } catch (err) {
      console.error('Fel vid radering:', err.response?.data || err);
    }
  };

  const botReply = () => {
    const response = [
      "Hej! Hur mår du idag? 😊",
      "Det låter intressant! 😃",
      "Berätta mer? 🤔",
      "Haha, det där var roligt 😂",
      "Du skojar 😂",
      "Okej, spännande! 👍"
    ];
    
    setTimeout(() => {
      const botMessage = {
          id: Date.now(),
          text: response[Math.floor(Math.random() * response.length)],
          username: "Leen",
          userId: 999,
          avatar: "https://i.pravatar.cc/150?u=999",
    };

      setMessages((prev) => {
        const updated = [...prev, botMessage];
        localStorage.setItem("messages", JSON.stringify(updated));
        return updated;
      });
    }, 1000);
  }
      
      useEffect(() => {
          if (messagesEndRef.current)  {
          messagesEndRef.current.scrollIntoView({behavior: "smooth"});
      }
      }, [messages]);

      
      useEffect(() => {
        const saved = localStorage.getItem("messages");
        if (saved){
          setMessages(JSON.parse(saved))
        }

        const load = async () => {
          try {
            const res = await axios.get(
              'https://chatify-api.up.railway.app/messages', {
                headers: {Authorization: `Bearer ${token}`}
              }
            )
        setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const updated = [...prev, ...res.data.filter((m) => !ids.has(m.id))];
          localStorage.setItem("messages", JSON.stringify(updated));
           return updated;
        });
      } catch (err) {
        console.error("fel vid hämtning av meddelande:", err);
      }
    };
        load()
      }, [token])
        
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
      <div className='relative z-20 p-6 flex flex-col h-screen'>
      <div className="flex items-center gap-3 mb-6 justify-center">
          <h2 className="text-3xl font-semibold text-[#5A314E]">
            Hej {user.username}
          </h2>
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-4">
          {messages.map((msg) => {
            const isMine = msg.userId === user.id;
            const avatarSrc = isMine ? (msg.avatar || user.avatar || `https://i.pravatar.cc/150?u=${user.id}`)
            : (msg.avatar || `https://i.pravatar.cc/150?u=${msg.userId || 'bot'}`);

return (
        <div
            key={msg.id}
            className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
 
        {!isMine && (
          <img src={avatarSrc} alt="avatar" className="w-12 h-12 rounded-full mb-3" />
      )}

        <div
            className={`p-3 rounded-lg max-w-[70%] ${
            isMine ? 'bg-white text-black' : 'bg-gray-200 text-black'
      }`}>
    
      <p className="text-sm font-semibold">{msg.username}</p>
      <p>{msg.text}</p>

      {isMine && (
        <button
          onClick={() => deleteMessage(msg.id)}
          className="text-xs text-pink-600 hover:text-pink-400 mt-1"
        >
          🗑️ Radera
        </button>
      )}
    </div>
        {isMine && (
        <img src={avatarSrc} alt="avatar" className="w-12 h-12 rounded-full mb-6" />
        )}

    </div>
  )})}
  <div ref={messagesEndRef} />
  </div>

        <form onSubmit={sendMessage} className="flex gap-2 fixed left-47 right-5 bottom-15 bg-gray-200 p-2 rounded-t-lg ">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv ett meddelande"
            className="flex-1 border p-2 rounded bg-gray-200 text-black"
          />
          <button
            type="submit"
            className="font-semibold px-4 py-2 rounded bg-[#7A4266] text-white hover:bg-[#5A314E] transition-colors duration-200">
            Skicka
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default Chat;
