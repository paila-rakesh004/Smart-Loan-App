import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

export const useCustomerProfile = () => {
  const router = useRouter();
  
  const [showpassword, setShowpassword] = useState(false);
  const [click, setClick] = useState(false);
  const [loading, setLoading] = useState(true);
 
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
        const [profileRes, statsRes] = await Promise.all([
          API.get('users/profile/'),
          API.get('loans/customer/stats/')
        ]);
        
        setProfile(profileRes.data);
        
        setEditForm({
          username: profileRes.data.username || '',
          email: profileRes.data.email || '',
          phone_number: profileRes.data.phone_number || ''
        });

        setStats(statsRes.data);

      } catch (error) {
        toast.error(error.response?.data?.error || "Data Fetching failed");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const avatarInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "U";

  return {
    router,
    showpassword,
    setShowpassword,
    click,
    loading,
    profile,
    editForm,
    stats,
    passwords,
    setPasswords,
    handleEditChange,
    handleUpdateProfile,
    handleChangePassword,
    avatarInitial
  };
};