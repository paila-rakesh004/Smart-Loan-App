import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";
import { getCookie } from '@/hooks/utils/cookies';

export const useOfficerProfile = () => {
  const router = useRouter();
  const [showpassword, setShowpassword] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [newUsername, setNewUsername] = useState('');
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);
  const [click, setClick] = useState(false);
  const [stats, setStats] = useState({ gold: 0, home: 0, personal: 0, education: 0, pending: 0, approved: 0, rejected: 0  });
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('users/update-profile/', { username: newUsername });
      setProfile({ ...profile, username: res.data.username});
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Username Already Exists!");
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setClick(true);
    try {
      await API.put('users/change-password/', passwords);
      setPasswords({ old_password: '', new_password: '' });
      toast.success("Password changed securely!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to change password.");
    }
    finally{
      setClick(false);
    }
  };
  useEffect(() => {
    const isOfficer = getCookie('is_officer');
    if (!isOfficer) {
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
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [router]);
  const avatarInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "O";

  return {
    router,
    showpassword,
    setShowpassword,
    profile,
    newUsername,
    setNewUsername,
    passwords,
    setPasswords,
    loading,
    click,
    stats,
    handleUpdateUsername,
    handleChangePassword,
    avatarInitial
  };
};