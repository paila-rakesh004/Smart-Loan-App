"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

const CustomerProfile = () => {
  const router = useRouter();
  
  const[showpassword,setShowpassword] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [stats, setStats] = useState({ total_applied: 0, total_approved: 0, total_rejected: 0 });
  
 
  const [newUsername, setNewUsername] = useState('');
  
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
      
        const profileRes = await API.get('users/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        setProfile(profileRes.data);
        setNewUsername(profileRes.data.username);

        const statsRes = await API.get('loans/customer/stats/', {
          headers: { Authorization: `Token ${token}` },
        });
        setStats(statsRes.data);

      } catch (error) {
        console.error("Failed to load profile data", error);
        toast.error("Could not load profile details.");
      }
    };

    fetchProfileData();
  }, [router]);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await API.put('users/update-profile/', { username: newUsername },{
        headers: { Authorization: `Token ${token}` },
      });
      
      setProfile({ ...profile, username: res.data.username});
      localStorage.setItem('username', res.data.username); 
      toast.success("updated successfully!");
    } catch (error) {
      toast.error("Failed to update.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await API.put('users/change-password/', passwords, {
        headers: { Authorization: `Token ${token}` },
      });
      
      setPasswords({ old_password: '', new_password: '' });
      toast.success("Password changed securely!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password.");
    }
  };

  
  const avatarInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen font-sans bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] p-10">
      
      
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="px-6 py-2 bg-white text-blue-900 font-bold rounded-lg shadow-md cursor-pointer hover:-translate-y-1 transition transform"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-indigo-900">My Profile</h1>
      </div>

     
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        
        <div className="col-span-1 space-y-6">
          
          
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg mb-4">
              {avatarInitial}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
            <p className="text-gray-500 mt-1">{profile.email || "No email provided"}</p>
          </div>

          
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">
              Loan Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-orange-200 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-600">Total Applied</span>
                <span className="text-2xl font-bold text-blue-600">{stats.total_applied}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-200 rounded-xl border border-green-100">
                <span className="font-semibold text-gray-600">Approved</span>
                <span className="text-2xl font-bold text-green-600">{stats.total_approved}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-200 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-600">Rejected</span>
                <span className="text-2xl font-bold text-red-600">{stats.total_rejected}</span>
              </div>
            </div>
          </div>

        </div>

    
        <div className="col-span-2 space-y-6">
          
          
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              Account Details
            </h3>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 cursor-pointer rounded-xl font-bold hover:bg-indigo-800 transition transform hover:-translate-y-1 w-full md:w-auto"
              >
                Save Changes
              </button>
            </form>
          </div>

          
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-3 mb-4">
              Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                <input
                  type={showpassword?"text" : "password"}
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type={showpassword ?"text" : 'password'}
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2 pr-14 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                type = "checkbox"
                name = "hide"
                onClick={() => {setShowpassword(!showpassword)}}
                className="w-3 h-3 accent-red-400 cursor-pointer mt-2"
                /> <label className='text-xs '>{showpassword ? "Hide password" : "Show password" }</label>
       
              </div>
              <button
                type="submit"
                className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-red-700 transition transform hover:-translate-y-1 w-full md:w-auto"
              >
                Update Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;