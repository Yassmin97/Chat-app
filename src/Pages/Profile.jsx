import SideNav from '../Components/SideNav';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const [form, setForm] = useState({username: user.username, email: '', avatar: user.avatar});
    const [message, setMessage] = useState('');

    const handelChange = e => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handelUpdate = async e => {
        e.preventDefault();
        setMessage('');

        try {
            const csrfRes = await axios.patch('https://chatify-api.up.railway.app/csrf', {}, { withCredentials: true});
            const csrfToken = csrfRes.data.csrfToken;

            await axios.put('https://chatify-api.up.railway.app/user', form, { headers: {
                Authorization: `Bearer ${token}`,
                'X-CSRF-TOKEN': csrfToken
            },
            withCredentials: true
        });

        localStorage.setItem('user', JSON.stringify({...user, ...form}));
        setMessage('Profilen uppdaterad!');
        }catch (err) {
            setMessage(err.response?.data?.error || 'Misslyckades');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Vill du verkligen radera ditt konto?')) return;

        try{
            const csrfRes = await axios.patch('https://chatify-api.up.railway.app/csrf', {}, { withCredentials: true });
            const csrfToken = csrfRes.data.csrfToken;

            await axios.delete(`https://chatify-api.up.railway.app/users/${user.id}`, {headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-TOKEN': csrfToken
        },
        withCredentials: true
      });

    localStorage.clear();
    navigate('/login');
        }catch(err){
            alert('Radering misslyckades');
        }
    };

    return (
        <div className='absolute inset-0 z-0' style={{
          backgroundImage: "url('/bakgrund.jpg')"}}>
            <SideNav />
            <div className='ml-120 p-6 w-full max-w-xl'>
                <h2 className='text-2xl font-semibold mb-4'>Min Profile</h2>
                <form onSubmit={handelUpdate} className='space-y-4'>
                    <div>
                    <label className='block mb-1 text-xl'>Användarnamn</label>
                    <input name="username" value={form.username} onChange={handelChange} className='w-full p-2 border rounded bg-gray-100' required />
                    </div>

                    <div>
                    <label className='block mb-1 font-medium text-xl'>Email</label>
                    <input name="email" value={form.email} onChange={handelChange} placeholder='Din e-post' className='w-full p-2 border rounded bg-gray-100' />
                    </div>

                    <div>
                    <label className='block mb-1 font-medium text-xl'>Avatar (bild url) </label>
                    <input name="avatar" value={form.avatar} onChange={handelChange} className='w-full p-2 border rounded bg-gray-100'/>
                    </div>

                    {form.avatar && (
                        <div className="mt-2">
                        <img src={form.avatar} alt="avatar preview" className="w-20 h-20 rounded-full border" />
                    </div>
                )}

                <button type='submit' className='bg-[#5A314E] text-white px-4 py-2 rounded hover:bg-[#5066C7]'>Uppdatera</button>
                </form>

                {message && <p className='mt-3 text-red-600 font-semibold'>{message}</p>}
                <hr className='my-6' />

                <button onClick={handleDelete} className='text-[#000000] font-semibold hover:text-white'>🗑️ Radera mitt konto</button>
            </div>
        </div>
    )
};

export default Profile;