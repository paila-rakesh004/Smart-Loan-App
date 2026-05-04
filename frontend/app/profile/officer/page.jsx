"use client";
import React from 'react';
import { useOfficerProfile } from '@/hooks/profiles/officer/useOfficer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AvatarCard from '@/components/profile/AvatarCard';
import UniversalFormField from '@/components/profile/UniversalFormField';
import SecuritySection from '@/components/profile/SecuritySection';

const PAGE_WRAPPER_CLASSES = "min-h-[100vh] font-sans bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] p-4 sm:p-6 lg:p-10";
const LOADER_CONTAINER_CLASSES = "flex justify-center items-center min-h-[100vh]";

export default function OfficerProfile() {
  const {
    router, showpassword, setShowpassword, profile, newUsername, setNewUsername,
    passwords, setPasswords, loading, stats, handleUpdateUsername,
    handleChangePassword, avatarInitial, click
  } = useOfficerProfile();

  if (loading) return <div className={LOADER_CONTAINER_CLASSES}><div className='animate-spin rounded-full border-6 border-gray-300 border-t-blue-700 h-15 w-15'></div></div>;

  return (
    <div className={PAGE_WRAPPER_CLASSES}>
      <ProfileHeader title="Officer Profile" backRoute="/dashboard/officer" router={router} />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 space-y-6">
          <AvatarCard avatarInitial={avatarInitial} username={profile.username} subtitle={profile.email || "Officer Account"}/>
          
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">Loans Stats</h3>
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
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-indigo-600 pl-3 mb-4 mt-2">My Actions</h3>
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6">Account Details</h3>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <UniversalFormField id="newUsername" label="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              <button type="submit" className="bg-indigo-600 text-white px-6 py-3 cursor-pointer rounded-xl font-bold hover:bg-indigo-800 transition transform hover:-translate-y-1 w-full sm:w-auto">
                Save Changes
              </button>
            </form>
          </div>
          
          <SecuritySection showpassword={showpassword} setShowpassword={setShowpassword} passwords={passwords} setPasswords={setPasswords} onSubmit={handleChangePassword} isUpdating={click}/>
        </div>
      </div>
    </div>
  );
}