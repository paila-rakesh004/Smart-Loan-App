"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
// import Link from "next/link";
// import styles from "./page.module.css";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  // const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    pan_number: "",
    aadhar_number: "",
    address: ""
  });
  const handleHome = ()=>{
    router.push("/");
  }
  const handleChange = (e) => {
    // setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("users/register/", formData);
      router.push("/login");
    } catch (error) {
      // setErrorMsg("Registration failed. Existing User details 🤔.");
      toast.error("Registration failed. Existing User details 🤔.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100vh] w-full font-serif">

      <div className="flex-1 bg-[url('/bank.webp')] bg-cover bg-center">
        <div className="bg-black/50 h-full text-white flex flex-col justify-center items-center gap-[10px]">
          <h1 className="text-4xl font-bold">Join Smart Loan</h1>
          <p className="text-lg">Create your account securely</p>
        </div>
      </div>

      <div className="flex flex-1 bg-black justify-center items-center">
        <div className="w-[420px] bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">

            <h2 className="text-center text-2xl">Customer Register</h2>

            {/* {errorMsg && <div className="bg-red-800 text-red-500 p-2 rounded-xl  text-center text-sm border">{errorMsg}</div>} */}

            <label>Username</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="username" onChange={handleChange} required disabled={loading} />

            <label>Email</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="email" type="email" onChange={handleChange} required disabled={loading} />

            <label>Phone Number</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="phone_number" maxLength={10} onChange={handleChange} required disabled={loading} />

            <label>PAN Number</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="pan_number" maxLength={10} onChange={handleChange} required disabled={loading} />

            <label>Aadhar Number</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="aadhar_number" maxLength={12} onChange={handleChange} required disabled={loading} />

            <label>Address</label>
            <textarea className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="address" onChange={handleChange} required disabled={loading} />

            <label>Password</label>
            <input className="p-2 rounded-xl border focus:border-indigo-500 outline-none" name="password" type="password" onChange={handleChange} required disabled={loading}/>

            <button type="submit" className="mt-4 mb-4 p-2 rounded-xl bg-indigo-500 text-white text-lg cursor-pointer hover:bg-red-500 hover:-translate-y-1" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>

            <button type = 'button' onClick={handleHome}
              className="p-2 rounded-xl bg-indigo-500 text-white text-lg cursor-pointer hover:bg-red-500 hover:-translate-y-1">Home
            </button>
          </form>
        </div>
      </div>

      
      {loading && (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-[9999]">
          <div className="w-[60px] h-[60px] border-[6px] border-[#f3f3f3] border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-[15px] text-white text-lg font-medium">Creating your account...</p>
        </div>
      )}

    </div>
  );
}