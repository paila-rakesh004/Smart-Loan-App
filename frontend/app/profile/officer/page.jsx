"use client";

import React from 'react';
import { useOfficerProfile } from '@/hooks/profiles/officer/useOfficer';
import { PAGE_WRAPPER, LOADER_BG, AVATAR_STYLE, EditField, PasswordField } from '@/components/SharedProfileUI';

const OfficerProfile = () => {
  const {
    router, showpassword, setShowpassword, profile, newUsername, setNewUsername,
    passwords, setPasswords, loading, stats, handleUpdateUsername, handleChangePassword,
    avatarInitial
  } = useOfficerProfile();

  if (loading) {
    return(
      <div className={LOADER_BG}>
        <div className='animate-spin rounded-full border-6 border-gray-300 border-t-blue-700 h-15 w-15'></div>
      </div>
    )
  }

  return (
    <div className={PAGE_WRAPPER}>
      
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
            <div className={AVATAR_STYLE}>
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
              
              <EditField 
                id="newUsername" 
                name="newUsername" 
                label="Username" 
                type="text" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
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
              
              <PasswordField 
                id="old_password" 
                label="Current Password" 
                type={showpassword ? "text" : "password"} 
                value={passwords.old_password} 
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} 
              />
              
              <div>
                <PasswordField 
                  id="new_password" 
                  label="New Password" 
                  type={showpassword ? "text" : "password"} 
                  value={passwords.new_password} 
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} 
                  extraClass="pr-14"
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