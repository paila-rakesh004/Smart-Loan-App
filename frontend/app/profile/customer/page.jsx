"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

const CustomerProfile = () => {
  const router = useRouter();
  
  const [showpassword, setShowpassword] = useState(false);
  const [click, setClick] = useState(false);
  const[loading,setLoading] = useState(true);
 
  const [profile, setProfile] = useState({ 
    username: '', email: '', phone_number: '', first_name: '', last_name: '' 
  });
  
  
  const [editForm, setEditForm] = useState({ 
    username: '', email: '', phone_number: '' 
  });
  
  const [stats, setStats] = useState({
     total_applied: 0, total_approved: 0, total_rejected: 0
     });
  const [passwords, setPasswords] = useState({ 
    old_password: '', new_password: '' 
  });

  
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('users/update-profile/', editForm);
      
      
      setProfile({ ...profile, ...res.data });
      localStorage.setItem('username', res.data.username); 
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Details Already Exists!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setClick(true);
      await API.put('users/change-password/', passwords);
      
      setPasswords({ old_password: '', new_password: '' });
      toast.success("Password changed securely!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Internal Error");
    } finally {
      setClick(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const profileRes = await API.get('users/profile/');
        
        setProfile(profileRes.data);
        
       
        setEditForm({
          username: profileRes.data.username || '',
          email: profileRes.data.email || '',
          phone_number: profileRes.data.phone_number || ''
        });

        const statsRes = await API.get('loans/customer/stats/');
        setStats(statsRes.data);

      } catch (error) {
        toast.error(error.response?.data?.error || "Data Fetching failed");
      }
      finally{
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);


  const avatarInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "U";

  if(loading){
    return(
      <div className='flex items-center justify-center h-screen bg-linear-to-r from-[#eef2f7] to-[#d9e4f5]'>
        <div className='animate-ping w-15 h-15 border-6 rounded-full border-b-transparent border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] p-4 sm:p-6 lg:p-10">
      
    
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 order-1 md:order-2 text-center md:text-right">
          My Profile
        </h1>
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="px-6 py-2 bg-white text-blue-900 font-bold rounded-lg shadow-md cursor-pointer hover:-translate-y-1 transition transform order-2 md:order-1 w-full md:w-auto text-center"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
       
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg mb-4">
              {avatarInitial}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{profile.username}</h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">{profile.email || "No email provided"}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">
              Loan Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-orange-100/50 rounded-xl border border-orange-100 transition hover:bg-orange-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Total Applied</span>
                <span className="text-xl sm:text-2xl font-bold text-orange-600">{stats.total_applied}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-100/50 rounded-xl border border-green-100 transition hover:bg-green-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Approved</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">{stats.total_approved}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-100/50 rounded-xl border border-red-100 transition hover:bg-red-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Rejected</span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.total_rejected}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6">
              Account Details
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  🔒 Verified Legal Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-gray-500 text-sm font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      value={profile.first_name || "N/A"}
                      disabled
                      className="w-full bg-gray-200 text-gray-500 border border-gray-300 rounded-xl p-3 cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor='last_name' className="block text-gray-500 text-sm font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      id='last_name'
                      value={profile.last_name || "N/A"}
                      disabled
                      className="w-full bg-gray-200 text-gray-500 border border-gray-300 rounded-xl p-3 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Need to update your legal name? <a href="mailto:dumimailra@gmail.com" className="text-blue-500 hover:underline">Contact Support</a>
                </p>
              </div>

              
              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor='username' className="block text-gray-700 font-semibold mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      id='username'
                      value={editForm.username}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor='email' className="block text-gray-700 font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id='email'
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor='phone_number' className="block text-gray-700 font-semibold mb-2">Mobile Number</label>
                    <input
                      type="text"
                      id='phone_number'
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-3 cursor-pointer rounded-xl font-bold hover:bg-indigo-800 transition transform hover:-translate-y-1 w-full sm:w-auto mt-2 shadow-md"
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
                <label htmlFor='old_password' className="block text-gray-700 font-semibold mb-2">Current Password</label>
                <input
                  type={showpassword ? "text" : "password"}
                  id='old_password'
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor='new_password' className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type={showpassword ? "text" : "password"}
                  id='new_password'
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
                disabled={click}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition transform shadow-md ${
                click
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-red-500 text-white cursor-pointer hover:bg-red-700 hover:-translate-y-1'
              }`}
              >
                {click ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;