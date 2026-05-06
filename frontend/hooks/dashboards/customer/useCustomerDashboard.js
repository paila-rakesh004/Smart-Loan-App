import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";

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

    const fetchData = async () => {
      try {
        const [profileRes, loanRes] = await Promise.all([
          API.get("users/profile/"),
          API.get("loans/my-loans/")
        ]);
        setUser(profileRes.data.username);
        setProfile(profileRes.data);
        setLoans(loanRes.data);
      } catch (error) {
        if (error?.response?.status !== 401) {
            toast.error(error?.response?.data?.error || "Failed to fetch dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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