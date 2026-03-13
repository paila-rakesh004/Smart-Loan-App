"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  
  const [showpass,setShowpass] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    // setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleHome = () => {
    router.push('/');
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setErrorMsg("");
  
    try {
      const res = await API.post("users/login/", formData);
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      if (role === "officer") {
        if (data.is_officer) {
          router.push("/dashboard/officer");
        } else {
          // setErrorMsg("You are not authorized as an Officer.");
          toast.error("You are not authorized as customer");
        }
      } else {
        if (data.is_customer) {
          router.push("/dashboard/customer");
        } else {
          // setErrorMsg("You are not authorized as a Customer.");
          toast.error("You are not authorized as customer");
        }
      }

    } catch (error) {
      // setErrorMsg("Invalid username or password");
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-serif">

      <div
        className="flex-1 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/bank.webp')" }}
      >
        <div className="bg-black/50 h-full text-white flex flex-col justify-center items-center gap-3">
          <h1 className="text-4xl font-bold">Smart Loan System</h1>
          <p className="text-lg">Fast • Secure • Reliable</p>
        </div>
      </div>

      
      <div className="flex-1 bg-black flex justify-center items-center">

        <div className="w-[350px] bg-white rounded-xl shadow-lg p-5">

        
          <div className="flex justify-around mb-4">
            <button
              className="px-4 py-2 rounded-md bg-indigo-100 cursor-pointer font-bold hover:bg-indigo-500 hover:text-white transition hover:-translate-x-2"
              onClick={() => setRole("customer")}
            >
              Customer Login
            </button>

            <button
              className="px-4 py-2 rounded-md bg-indigo-100 cursor-pointer font-bold hover:bg-indigo-500 hover:text-white transition hover:translate-x-2"
              onClick={() => setRole("officer")}
            >
              Officer Login
            </button>
          </div>

         
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <label>
              {role === "customer" ? "Username" : "Bank Officer ID"}
            </label>

            <input
              className="p-2 border border-gray-300 rounded-xl focus:border-indigo-500 outline-none"
              name="username"
              placeholder={role === "customer" ? "Enter Username" : "Enter Officer ID"}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <label>Password</label>

            <input
              className="p-2 border border-gray-300 rounded-xl focus:border-indigo-500 outline-none"
              name="password"
              type={showpass ? "text" : "password"}
              placeholder="Enter Password"
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div className="flex items-center gap-2">
             <input
                type = "checkbox"
                name = "hide"
                onClick={() => {setShowpass(!showpass)}}
                className="w-3 h-3 accent-red-400 cursor-pointer"
                /> <label className='text-xs'>{showpass ? "Hide password" : "Show password" }</label></div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 p-2 rounded-md bg-indigo-500 text-white text-lg hover:bg-red-500 transition hover:-translate-y-1"
            >
              {loading
                ? "Signing in..."
                : `Login as ${role === "customer" ? "Customer" : "Officer"}`}
            </button>

            <button type = 'button' className="text-center text-white mt-3 bg-blue-500 py-1 rounded-md cursor-pointer hover:-translate-y-1 hover:bg-red-400" onClick={handleHome}>
                Home
            </button>

          </form>
        </div>
      </div>

     
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex flex-col justify-center items-center z-50">

          <div className="w-16 h-16 border-[6px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>

          <p className="text-white text-lg font-medium mt-4">
            Signing you in...
          </p>

        </div>
      )}

    </div>
  );
}