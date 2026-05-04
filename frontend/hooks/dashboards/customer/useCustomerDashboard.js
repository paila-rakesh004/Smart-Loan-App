import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";
import { getCookie } from "@/hooks/utils/cookies"; 

export const useCustomerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState("User");
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await API.post("users/logout/"); 
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to logout.");
    } finally {
      router.push("/login");
    }
  };

  const handleProfile = () => {
    router.push('/profile/customer');
  };

  const handleLoan = () => {
    router.push("/loan/apply");
  };

  useEffect(() => {
    const storedUser = getCookie("username");
    if (storedUser) setUser(storedUser);

    const fetchData = async () => {
      try {
        const [profileRes, loanRes] = await Promise.all([
          API.get("users/profile/"),
          API.get("loans/my-loans/")
        ]);
        
        setProfile(profileRes.data);
        setLoans(loanRes.data);
      } catch (error) {
        if (error?.response?.status !== 401) {
            const message = error?.response?.data?.error || "Failed to fetch dashboard data.";
            toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    user,
    profile,
    loans,
    loading,
    handleLogout,
    handleProfile,
    handleLoan
  };
};