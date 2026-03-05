"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState("User");
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleLoan = () => {
    router.push("/loan/apply");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("username");
    if (storedUser) setUser(storedUser);

    const fetchProfile = async () => {
      try {
        const res = await API.get("users/profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    const fetchLoans = async () => {
      try {
        const res = await API.get("loans/my-loans/", {
          headers: { Authorization: `Token ${token}` },
        });
        setLoans(res.data);
      } catch (error) {
        console.error("Failed to fetch loans", error);
      }
    };

    fetchProfile();
    fetchLoans();
  }, [router]);

  return (
    <div className="flex items-center font-serif justify-center bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen">

      <div className="w-[800px] p-10 font-sans">

        <div className="text-center mb-2 text-blue-900">
          <h1 className="text-3xl font-semibold mb-10">Customer Dashboard</h1>
        </div>

        <div className="text-center mb-8 text-gray-700 text-xl font-bold">
          <h2>Welcome {user}</h2>
        </div>

        
        <h3 className="mt-5 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
          Profile Details
        </h3>

        {profile ? (
          <div className="flex justify-between gap-8 bg-white p-6 rounded-xl shadow-md mb-10">

            <div className="space-y-2 text-gray-700 text-base">
              <p><span className="font-bold">User Name :</span> {profile.username}</p>
              <p><span className="font-bold">Email :</span> {profile.email}</p>
              <p><span className="font-bold">Phone Number :</span> {profile.phone_number}</p>
            </div>

            <div className="space-y-2 text-gray-700 text-base">
              <p><span className="font-bold">PAN :</span> {profile.pan_number}</p>
              <p><span className="font-bold">Aadhar Number :</span> {profile.aadhar_number}</p>
              <p><span className="font-bold">Address :</span> {profile.address}</p>
            </div>

          </div>
        ) : (
          <div>Loading Profile...</div>
        )}

       
        <h3 className="mt-5 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
          My Loan Applications
        </h3>

        {loans.length > 0 ? (
          loans.map((loan, index) => (
            <div key={index} className="flex flex-col bg-white  p-6 rounded-xl shadow-md mb-10">

              <p><span className="font-bold text-gray-800">Loan Type :</span> {loan.loan_type}</p>
              <p><span className="font-bold text-gray-800">Amount :</span> {loan.loan_amount}</p>
              <p><span className="font-bold text-gray-800">Status :</span> {loan.status}</p>
              <p>
                <span className="font-bold">Applied Date :</span>{" "}
                {new Date(loan.created_at).toLocaleDateString()}
              </p>

            </div>
          ))
        ) : (
          <p>No loans applied yet.</p>
        )}

       
        <div className="flex items-center justify-center gap-6">

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white w-[200px] h-[50px] font-bold rounded-lg text-lg hover:bg-red-700 transition transform hover:-translate-y-1 hover:rounded-2xl"
          >
            Logout
          </button>

          <button
            onClick={handleLoan}
            className="bg-blue-600 text-white w-[200px] h-[50px] font-bold rounded-lg text-lg hover:bg-blue-800 transition transform hover:-translate-y-1 hover:rounded-2xl"
          >
            Apply Loan
          </button>

        </div>

      </div>
    </div>
  );
};

export default Page;