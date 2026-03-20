"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const router = useRouter();
  
  
  const [step, setStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const [timer, setTimer] = useState(0);
  
  const[click,setClick] = useState(false);

  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const handleSendOTP = async () => {
    if (!username.trim()) {
      toast.error("Please enter your username first.");
      return;
    }
    
    setClick(true);
    try {
      const res = await API.post('users/send-otp/', { username });
      toast.success(res.data.message || "OTP sent to your registered email!");
      setOtpSent(true);
      setTimer(120);
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
    finally{
      setClick(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      await API.post('users/verify-otp/', {
        username: username,
        otp: otp
      });
      toast.success("Identity Verified! Please set your new password.");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid or expired OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await API.post('users/reset-password-otp/', {
        username: username,
        otp: otp,
        new_password: newPassword
      });
      
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password. OTP may have expired.");
    }
  };
  
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && otpSent) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent]);

  return (
    <div className="min-h-screen font-sans bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] flex items-center justify-center p-6">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 transition-all duration-500">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-900 mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm">
            {step === 1 ? "Secure your account using Email OTP verification." : "Create a strong new password."}
          </p>
        </div>

        {step === 1 ? (
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={otpSent && timer > 0}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                required
                placeholder="Enter your username"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={click || timer > 0 || !username}
              className={`w-full py-3 rounded-xl font-bold transition transform shadow-md ${
                timer > 0 || !username || click
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-800 hover:-translate-y-1'
              }`}
            >
              {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Send OTP to Email"}
            </button>

           
            {otpSent && (
              <form onSubmit={handleVerifyOTP} className="pt-4 border-t border-gray-100 mt-6 space-y-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-center text-lg">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-2xl border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                    placeholder="------"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-800 transition transform hover:-translate-y-1 shadow-md"
                >
                  Verify OTP
                </button>
              </form>
            )}
          </div>

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