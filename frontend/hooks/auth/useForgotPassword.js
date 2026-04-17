import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { toast } from "react-toastify";

export const useForgotPassword = () => {
  const router = useRouter();
  
  const [step, setStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [click, setClick] = useState(false);

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
      toast.error(error.response?.data?.error || "Server error! OTP could not be sent.");
    } finally {
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
      await API.post('users/verify-otp/', { username, otp });
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

  return {
    step,
    showPassword,
    setShowPassword,
    otpSent,
    timer,
    click,
    username,
    setUsername,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    formatTime,
    handleSendOTP,
    handleVerifyOTP,
    handleResetPassword,
    router
  };
};