"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Login() {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("token/", { 
        username: formData.username,
        password: formData.password
      });
      
      console.log("JWT RESPONSE DATA:", res.data);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username", formData.username);
      localStorage.setItem('is_officer', res.data.is_officer);
      
      
      if (role === "officer") {
        if (res.data.is_officer) {
          router.push("/dashboard/officer");
        } else {
          toast.error("You are not authorized as Officer");
        }
      } else {
        if (res.data.is_customer) {
          router.push("/dashboard/customer");
        } else {
          toast.error("You are not authorized as Customer");
        }
      }

    } catch (error) {
      console.log(error);
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[url('/bgimg.png')] bg-cover bg-center font-serif">

      <div className="min-h-screen w-full bg-black/70 flex flex-col md:flex-row">

       
        <div className="flex-[0.5] text-white flex flex-col justify-center px-6 sm:px-10 md:px-16 py-10">
          
          <h1 className="text-3xl text-indigo-500 sm:text-4xl md:text-6xl font-bold">
            Smart Loan System
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-2xl text-white max-w-xl">
            A smarter way to manage your loan applications with speed, security, and simplicity. 
          </p>


        </div>

       
        <div className="flex-[0.5] flex justify-center items-center px-6 py-10">

          <div className="w-full max-w-sm backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl shadow-xl p-5 sm:p-6">

            
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mb-4">
              <button
                className={`px-4 py-2 rounded-md font-bold transition transform ${
                  role === "customer"
                    ? "bg-indigo-500 text-white lg:hover:translate-x-2"
                    : "bg-indigo-100 hover:bg-indigo-500 hover:text-white hover:cursor-pointer lg:hover:translate-x-2"
                }`}
                onClick={() => setRole("customer")}
              >
                Customer Login
              </button>

              <button
                className={`px-4 py-2 rounded-md font-bold transition transform ${
                  role === "officer"
                    ? "bg-indigo-500 text-white lg:hover:-translate-x-2"
                    : "bg-indigo-100 hover:bg-indigo-500 hover:text-white hover:cursor-pointer lg:hover:-translate-x-2"
                }`}
                onClick={() => setRole("officer")}
              >
                Officer Login
              </button>
            </div>

            
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              <label className="text-sm font-medium text-white">
                {role === "customer" ? "Username" : "Bank Officer ID"}
              </label>

              <input
                className="p-2 border border-white/40 bg-white/30 rounded-xl outline-none text-white placeholder-white/70 focus:border-indigo-400 w-full"
                name="username"
                placeholder={role === "customer" ? "Enter Username" : "Enter Officer ID"}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <label className="text-sm font-medium text-white">Password</label>

              <input
                className="p-2 border border-white/40 bg-white/30 rounded-xl outline-none text-white placeholder-white/70 focus:border-indigo-400 w-full"
                name="password"
                type={showpass ? "text" : "password"}
                placeholder="Enter Password"
                onChange={handleChange}
                required
                disabled={loading}
                maxLength="10"
              />

              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-white">

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onClick={() => setShowpass(!showpass)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                  <label>
                    {showpass ? "Hide password" : "Show password"}
                  </label>
                </div>

                <button
                  type="button"
                  className="text-indigo-200 hover:underline cursor-pointer"
                  onClick={() => router.push('/forgot-password')}
                >
                  Forgot Password?
                </button>

              </div>

              
              <button
                type="submit"
                disabled={loading}
                className="mt-3 py-2 rounded-md cursor-pointer bg-indigo-500 text-white text-base sm:text-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
              >
                {loading
                  ? "Signing in..."
                  : `Login as ${role === "customer" ? "Customer" : "Officer"}`}
              </button>

              
              <button
                type="button"
                className="text-center cursor-pointer text-white mt-2 bg-blue-500 py-2 rounded-md hover:bg-blue-700 transition transform hover:-translate-y-1"
                onClick={handleHome}
              >
                Home
              </button>

            </form>
          </div>
        </div>
      </div>

      
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex flex-col justify-center items-center z-50">

          <div className="w-14 h-14 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>

          <p className="text-white text-base sm:text-lg font-medium mt-4">
            Signing you in...
          </p>

        </div>
      )}
    </div>
  );
}