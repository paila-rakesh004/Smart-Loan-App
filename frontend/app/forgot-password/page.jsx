"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleVerifyAadhar = async (e) => {
    e.preventDefault();
    try {
      await API.post('users/verify-aadhar/', {
        username: username,
        aadhar_number: aadharNumber
      });
      toast.success("Identity Verified!");
      setStep(2); 
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await API.post('users/reset-password/', {
        username: username,
        aadhar_number: aadharNumber,
        new_password: newPassword
      });
      
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] flex items-center justify-center p-6">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-900 mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm">
            {step === 1 ? "Verify your identity using your Aadhaar number." : "Create a strong new password."}
          </p>
        </div>

        {step === 1 ? (
          
          <form onSubmit={handleVerifyAadhar} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">Aadhaar Number</label>
              <input
                type="text"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                placeholder="12-digit Aadhaar Number"
                maxLength="12"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-800 transition transform hover:-translate-y-1 shadow-md"
            >
              Verify Identity
            </button>
          </form>
        ) : (
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Show Passwords
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-green-700 transition transform hover:-translate-y-1 shadow-md"
            >
              Set New Password
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button 
            onClick={() => router.push('/login')}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Wait, I remember my password
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;