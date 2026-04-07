"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState("User");
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const[loading,setLoading] = useState(true);
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    router.push("/login");
  };
  const handleProfile = () =>{
    router.push('/profile/customer')
  }
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
      const profileRes = await API.get("users/profile/");
      const loanRes = await API.get("loans/my-loans/");

      setProfile(profileRes.data);
      console.log("Loan Data:", profileRes.data);
      setLoans(loanRes.data);
      console.log(loanRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [router]);

  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
      <div className="w-15 h-15 border-6 border-blue-500 border-b-transparent rounded-full animate-ping"></div>
    </div>
  );
}

  return (
    <div className="relative font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
      
      
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60] py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex-1 flex justify-center md:justify-start">
             <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-900 text-center">
               Customer Dashboard
             </h1>
          </div>

          <div className="flex justify-center gap-2 sm:gap-4">
            
            <button
              onClick={handleLoan}
              className="bg-blue-600 cursor-pointer mr-25 md:m-0 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-bold text-sm sm:text-base hover:bg-blue-800 transition transform hover:-translate-y-1 shadow-md"
            >
              Apply Loan
            </button>

            <button
             onClick={handleProfile}
             className="cursor-pointer rounded-full transition transform hover:-translate-y-1 ">
              <UserCircleIcon className="w-10 h-10 text-blue-700" />
            </button>

            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-full font-bold transition transform hover:-translate-y-1"
            >
              <ArrowRightOnRectangleIcon className="w-9 h-9 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      
      <div className="h-44 md:h-32"></div>

      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-10 w-full">
          
          <h2 className="mb-8 text-gray-800 text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Welcome, <span className="text-blue-600">{user}</span>
          </h2>

          <h2 className="mt-4 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
            Profile Details
          </h2>

          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-indigo-50/50 p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-100 text-gray-800 mb-10">
              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">User Name :</span> {profile.username}</p>
                <p><span className="font-bold text-gray-700">Email :</span> {profile.email}</p>
                <p><span className="font-bold text-gray-700">Phone Number :</span> {profile.phone_number}</p>
              </div>
              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">PAN :</span> {profile.pan_number}</p>
                <p><span className="font-bold text-gray-700">Aadhar Number :</span> {profile.aadhar_number}</p>
                <p><span className="font-bold text-gray-700">Address :</span> {profile.address}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-2xl text-gray-500 italic text-center mb-10 animate-pulse">
              Loading Profile Details...
            </div>
          )}

          <h2 className="mt-6 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
            My Loan Applications
          </h2>

        
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[700px] border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700 border-b border-gray-200">
                  <th className="p-4 font-bold">Loan Type</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Applied Date</th>
                  <th className="p-4 font-bold">Officer Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loans.length > 0 ? (
                  loans.map((loan, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="p-4 font-medium text-gray-800">{loan.loan_type}</td>
                      <td className="p-4 text-gray-700">₹{loan.loan_amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                          loan.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          loan.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate" title={loan.officer_notes}>
                        {loan.officer_notes ? loan.officer_notes : <span className="text-gray-400 italic">No remarks yet</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500 font-medium italic">
                      You haven't applied for any loans yet.
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