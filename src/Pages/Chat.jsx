import SideNav from '../Components/SideNav';
import React, { useEffect, useState, useRef } from 'react';
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

  const sortByDate = (arr) => {
    return [...arr].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const interleaveMessages = (allMsgs) => {
    if (!allMsgs || allMsgs.length === 0) return [];

    const userMsgs = sortByDate(allMsgs.filter(m => m.userId === user.id));
    const otherMsgs = sortByDate(allMsgs.filter(m => m.userId !== user.id));

    const result = [];
    let takeUser = userMsgs.length > 0;

    let u = 0, o = 0;
    while (u < userMsgs.length && o < otherMsgs.length) {
      if (takeUser) {
        result.push(userMsgs[u++]);
      } else {
        result.push(otherMsgs[o++]);
      }
      takeUser = !takeUser;
    }

    while (u < userMsgs.length) result.push(userMsgs[u++]);
    while (o < otherMsgs.length) result.push(otherMsgs[o++]);

    return result;
  };

    const combineAndInterleave = (serverMsgs, localMsgs) => {
    const serverIds = new Set(serverMsgs.map(m => m.id));
    const combined = [...serverMsgs, ...localMsgs.filter(m => !serverIds.has(m.id))];

    const normalized = combined.map(m => ({ ...m, createdAt: m.createdAt || new Date().toISOString() }));
    return interleaveMessages(normalized);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('https://chatify-api.up.railway.app/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const localMsgs = JSON.parse(localStorage.getItem("messages")) || [];
      const serverMsgs = res.data.map(m => ({ ...m,userId: m.userId || m.user?.id, createdAt: m.createdAt || new Date().toISOString() }));

      const final = combineAndInterleave(serverMsgs, localMsgs);
      setMessages(final);

      localStorage.setItem("messages", JSON.stringify(final));
    } catch (err) {
      console.error('Fel vid hämtning av meddelande:', err);

      const localMsgs = JSON.parse(localStorage.getItem("messages")) || [];
      const final = interleaveMessages(localMsgs);
      setMessages(final);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const response = await axios.post('https://chatify-api.up.railway.app/messages',
        { text },
        { headers: { Authorization: `Bearer ${token}` } });

      const savedMessage = response.data.latestMessage || response.data;
      savedMessage.userId = user.id;
      savedMessage.createdAt = savedMessage.createdAt || new Date().toISOString();

      setMessages(prev => {
        const prevAll = prev.slice(); 
        const newAll = combineAndInterleave([...prevAll, savedMessage], []);

        localStorage.setItem("messages", JSON.stringify(newAll));
        return newAll;
      });

      botReply();
      setText('');
    } catch (err) {
      console.error('Fel vid skickande:', err.response?.data || err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`https://chatify-api.up.railway.app/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(prev => {
        const remaining = prev.filter(m => m.id !== id);
        const reInterleaved = interleaveMessages(remaining);
        localStorage.setItem("messages", JSON.stringify(reInterleaved));
        return reInterleaved;
      });
    } catch (err) {
      console.error('Fel vid radering:', err.response?.data || err);
    }
  };

  const botReply = () => {
    const responses = [
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
        text: responses[Math.floor(Math.random() * responses.length)],
        username: "Leen",
        userId: 999,
        avatar: "https://i.pravatar.cc/150?u=999",
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => {
        const newAll = combineAndInterleave(prev, [botMessage]); 
        localStorage.setItem("messages", JSON.stringify(newAll));
        return newAll;
      });
    }, 1000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const localMsgs = JSON.parse(localStorage.getItem("messages")) || [];
    if (localMsgs.length > 0) {
      const initial = interleaveMessages(localMsgs);
      setMessages(initial);
    }
    fetchMessages();
  }, []);

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className='flex-1 ml-40 relative'>
        <div className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/bakgrund.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>  
        </div>

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
              const avatarSrc = isMine
                ? (msg.avatar || user.avatar || `https://i.pravatar.cc/150?u=${user.id}`)
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
    
      <p className="text-sm font-semibold">{msg.username || msg.user?.username || user.username}</p>
      <p>{msg.text || msg.content}</p>

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
