import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export const useCustomerDashboard = () => {
  const router = useRouter();
  
  const [user, setUser] = useState("User");
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem('is_officer');
    router.push("/login");
  };

  const handleProfile = () => {
    router.push('/profile/customer');
  };

  const handleLoan = () => {
    router.push("/loan/apply");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("username");
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
        console.log("Failed to load data.", error);
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