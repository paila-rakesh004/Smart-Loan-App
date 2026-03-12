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
    <div className="font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen">
      <div className="w-full p-10 font-sans">
        
       
        <div className="sticky top-10 z-50 flex justify-between items-center bg-white shadow-xl rounded-xl p-6 mb-8 w-full">
          <h1 className="text-3xl font-semibold text-blue-900">
            Customer Dashboard
          </h1>

          <div className="flex gap-4">
            <button className="bg-indigo-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition transform hover:-translate-y-1">
              Profile
            </button>
            <button
              onClick={handleLoan}
              className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition transform hover:-translate-y-1"
            >
              Apply Loan
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition transform hover:-translate-y-1"
            >
              Logout
            </button>
          </div>
        </div>

        
        <div className="bg-white shadow-md rounded-[2rem] p-10 overflow-y-auto">
          
          <h2 className="mb-8 text-gray-800 text-3xl pl-135 font-bold">
            Welcome, <span className="text-blue-600">{user}</span>
          </h2>

          
          <h2 className="mt-4 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
            Profile Details
          </h2>

          {profile ? (
            <div className="grid grid-cols-2 gap-6 bg-indigo-50 px-70 py-8 rounded-xl shadow-md text-gray-800 mb-10">
              <div className="space-y-2">
                <p><span className="font-bold">User Name :</span> {profile.username}</p>
                <p><span className="font-bold">Email :</span> {profile.email}</p>
                <p><span className="font-bold">Phone Number :</span> {profile.phone_number}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-bold">PAN :</span> {profile.pan_number}</p>
                <p><span className="font-bold">Aadhar Number :</span> {profile.aadhar_number}</p>
                <p><span className="font-bold">Address :</span> {profile.address}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-gray-500 italic">Loading Profile...</div>
          )}

          
          <h2 className="mt-6 mb-6 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
            My Loan Applications
          </h2>

          <div className="overflow-x-auto px-40">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 rounded-tl-lg">Loan Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3 rounded-tr-lg">Officer Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loans.length > 0 ? (
                  loans.map((loan, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-800">{loan.loan_type}</td>
                      <td className="p-3">₹{loan.loan_amount}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${
                          loan.status === 'Approved' ? 'text-green-600' : 
                          loan.status === 'Rejected' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-600">
                        {loan.officer_notes ? loan.officer_notes : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                      No loans applied yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Page;