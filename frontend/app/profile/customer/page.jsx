"use client";
import React from 'react';
import { useCustomerProfile } from '@/hooks/profiles/customer/useCustomer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AvatarCard from '@/components/profile/AvatarCard';
import UniversalFormField from '@/components/profile/UniversalFormField';
import SecuritySection from '@/components/profile/SecuritySection';

const PAGE_WRAPPER = "min-h-[100vh] font-sans bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] p-4 sm:p-6 lg:p-10";
const LOADER_BG = "flex items-center justify-center min-h-[100vh] bg-linear-to-r from-[#eef2f7] to-[#d9e4f5]";

export default function CustomerProfile() {
  const {
    router, showpassword, setShowpassword, click, loading, profile, editForm,
    stats, passwords, setPasswords, handleEditChange, handleUpdateProfile,
    handleChangePassword, avatarInitial
  } = useCustomerProfile();

  if(loading) return <div className={LOADER_BG}><div className='animate-ping w-15 h-15 border-6 rounded-full border-b-transparent border-blue-500'></div></div>;

  return (
    <div className={PAGE_WRAPPER}>
      <ProfileHeader title="My Profile" backRoute="/dashboard/customer" router={router} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 space-y-6">
          <AvatarCard avatarInitial={avatarInitial} username={profile.username} subtitle={profile.email || "No email provided"} />

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">Loan Statistics</h3>
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6">Account Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">🔒 Verified Legal Identity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UniversalFormField id="first_name" label="First Name" value={profile.first_name} disabled />
                  <UniversalFormField id="last_name" label="Last Name" value={profile.last_name} disabled />
                </div>
                <p className="text-xs text-gray-400 mt-3">Need to update your legal name? <a href="mailto:dumimailra@gmail.com" className="text-blue-500 hover:underline">Contact Support</a></p>
              </div>

              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <UniversalFormField id="username" name="username" label="Username" value={editForm.username} onChange={handleEditChange} />
                  </div>
                  <UniversalFormField id="email" name="email" label="Email Address" type="email" value={editForm.email} onChange={handleEditChange} />
                  <UniversalFormField id="phone_number" name="phone_number" label="Mobile Number" value={editForm.phone_number} onChange={handleEditChange} />
                </div>
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 cursor-pointer rounded-xl font-bold hover:bg-indigo-800 transition transform hover:-translate-y-1 w-full sm:w-auto mt-2 shadow-md">
                Save Changes
              </button>
            </form>
          </div>

          <SecuritySection showpassword={showpassword} setShowpassword={setShowpassword} passwords={passwords} setPasswords={setPasswords} onSubmit={handleChangePassword} isUpdating={click} />
        </div>
      </div>
    </div>
  );
}