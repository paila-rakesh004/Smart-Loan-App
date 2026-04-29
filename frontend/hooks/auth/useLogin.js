import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const useLogin = () => {
  const router = useRouter();
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [showpass, setShowpass] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleHome = () => {
    router.push('/');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("token/", { 
        username: formData.username,
        password: formData.password
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username", formData.username);
      localStorage.setItem('is_officer', res.data.is_officer);
      if (role === "officer" && res.data.is_officer) {
        router.push("/dashboard/officer");
      } else if (role === "officer") {
        toast.error("You are not authorized as Officer");
      } else if (role === "customer" && res.data.is_customer) {
        router.push("/dashboard/customer");
      } else if (role === "customer") {
        toast.error("You are not authorized as Customer");
      }
    } catch (error) {
      const message = error?.response?.data?.error || "Login Failed! Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  const rolelabel = role === "customer" ? "Customer" : "Officer";
  return {
    role,
    setRole,
    loading,
    showpass,
    setShowpass,
    formData,
    handleChange,
    handleSubmit,
    handleHome,
    rolelabel,
    router
  };
};