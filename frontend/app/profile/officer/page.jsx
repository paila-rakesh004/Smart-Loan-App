"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

const PAGE_WRAPPER_CLASSES = "min-h-[100vh] font-sans bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] p-4 sm:p-6 lg:p-10";
const LOADER_CONTAINER_CLASSES = "flex justify-center items-center min-h-[100vh]";
const AVATAR_CLASSES = "w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg mb-4";
const FORM_LABEL_CLASSES = "block text-gray-700 font-semibold mb-2";

const OfficerProfile = () => {
  const router = useRouter();
  
  const [showpassword, setShowpassword] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [newUsername, setNewUsername] = useState('');
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
  const [loading,setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    gold: 0, home: 0, personal: 0, education: 0, pending: 0, approved: 0, rejected: 0 
  });

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('users/update-profile/', { username: newUsername });
      setProfile({ ...profile, username: res.data.username});
      localStorage.setItem('username', res.data.username); 
      toast.success("Profile updated successfully!");
    } catch(error){
      console.log("Some thing went wrong", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await API.put('users/change-password/', passwords);
      setPasswords({ old_password: '', new_password: '' });
      toast.success("Password changed securely!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const isOfficer = localStorage.getItem('is_officer');
    if(!isOfficer){
      toast.error("Security Alert: Unauthorized Access");
      router.push('/profile/customer');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          API.get('users/profile/'),
          API.get('loans/officer/stats/')
        ]);

        setProfile(profileRes.data);
        setNewUsername(profileRes.data.username);
        setStats(statsRes.data);

      } catch (error) {
        if (error.response?.status === 403) {
            router.push('/profile/customer');
        }
      } finally {
        setLoading(false)
      }
    };
    fetchProfileData();
  }, [router]);

  const avatarInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "O";

  if (loading) {
    return(
      <div className={LOADER_CONTAINER_CLASSES}>
        <div className='animate-spin rounded-full border-6 border-gray-300 border-t-blue-700 h-15 w-15'></div>
      </div>
    )
  }

  return (
    <div className={PAGE_WRAPPER_CLASSES}>
      
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 order-1 md:order-2 text-center md:text-right">
          Officer Profile
        </h1>
        <button
          onClick={() => router.push('/dashboard/officer')}
          className="px-6 py-2 bg-white text-blue-900 font-bold rounded-lg shadow-md cursor-pointer hover:-translate-y-1 transition transform order-2 md:order-1 w-full md:w-auto text-center"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center">
            <div className={AVATAR_CLASSES}>
              {avatarInitial}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{profile.username}</h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">{profile.email || "Officer Account"}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">
              Loans Stats
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-6">
              <div className="flex flex-col p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                <span className="font-semibold text-gray-600 text-xs sm:text-sm">Gold</span>
                <span className="text-lg sm:text-xl font-bold text-yellow-600">{stats.gold}</span>
              </div>
              <div className="flex flex-col p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                <span className="font-semibold text-gray-600 text-xs sm:text-sm">Home</span>
                <span className="text-lg sm:text-xl font-bold text-indigo-600">{stats.home}</span>
              </div>
              <div className="flex flex-col p-3 bg-pink-50 rounded-xl border border-pink-200 text-center">
                <span className="font-semibold text-gray-600 text-xs sm:text-sm">Personal</span>
                <span className="text-lg sm:text-xl font-bold text-pink-600">{stats.personal}</span>
              </div>
              <div className="flex flex-col p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <span className="font-semibold text-gray-600 text-xs sm:text-sm">Education</span>
                <span className="text-lg sm:text-xl font-bold text-blue-600">{stats.education}</span>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-indigo-600 pl-3 mb-4 mt-2">
              My Actions
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-100 rounded-xl border border-orange-200">
                <span className="font-semibold text-gray-700 text-sm">Pending</span>
                <span className="text-lg font-bold text-orange-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-xl border border-green-200">
                <span className="font-semibold text-gray-700 text-sm">Approved</span>
                <span className="text-lg font-bold text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-100 rounded-xl border border-red-200">
                <span className="font-semibold text-gray-700 text-sm">Rejected</span>
                <span className="text-lg font-bold text-red-600">{stats.rejected}</span>
              </div>
            </div>
          </div>
        </div>
      
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6">
              Account Details
            </h3>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
                <label htmlFor='newUsername' className={FORM_LABEL_CLASSES}>Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 cursor-pointer rounded-xl font-bold hover:bg-indigo-800 transition transform hover:-translate-y-1 w-full sm:w-auto"
              >
                Save Changes
              </button>
            </form>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-3 mb-6">
              Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label htmlFor='old_password' className={FORM_LABEL_CLASSES}>Current Password</label>
                <input
                  type={showpassword ? "text" : "password"}
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor='new_password' className={FORM_LABEL_CLASSES}>New Password</label>
                <input
                  type={showpassword ? "text" : "password"}
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 pr-14 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  required
                />
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="showPasswordToggle"
                    onClick={() => {setShowpassword(!showpassword)}}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  /> 
                  <label htmlFor="showPasswordToggle" className="text-sm text-gray-600 ml-2 cursor-pointer select-none">
                    {showpassword ? "Hide password" : "Show password" }
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-red-700 transition transform hover:-translate-y-1 w-full sm:w-auto mt-2"
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
export default OfficerProfile;