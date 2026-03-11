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
    <div className="flex font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen">
      <div className="w-full p-10 font-sans">
        <div className="text-center mb-2 text-blue-900 bg-white rounded-xl flex items-center justify-">
          <button className="bg-blue-600 cursor-pointer text-white w-auto px-6 h-[50px] font-bold rounded-lg text-lg hover:bg-blue-800 transition hover:-translate-y-1 hover:rounded-2xl">Profile</button>
          <h1 className="text-3xl font-bold p-6">Customer Dashboard</h1>

          <button
            onClick={handleLoan}
            className="bg-blue-600 cursor-pointer text-white w-auto px-6 h-[50px] font-bold rounded-lg text-lg hover:bg-blue-800 transition hover:-translate-y-1 hover:rounded-2xl"
          >
            Apply Loan
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 cursor-pointer text-white w-auto px-6 h-[50px] font-bold rounded-lg text-lg hover:bg-red-700 transition transform hover:-translate-y-1 hover:rounded-2xl"
          >
            Logout
          </button>
        </div>

        <div className="text-center mb-8 text-gray-700 text-2xl font-bold">
          <h1>
            Welcome <span>{user}</span>
          </h1>
        </div>

        {profile ? (
          <div className="flex flex-col gap-8 bg-white p-6 rounded-xl shadow-md mb-10">
            <div className="text-2xl font-bold text-center">
              Profile Details
            </div>

            <div className="flex justify-center">
              <div className="space-y-2 text-gray-700 ml-50">
                <p><span className="font-bold">User Name :</span> {profile.username}</p>
                <p><span className="font-bold">Email :</span> {profile.email}</p>
                <p><span className="font-bold">Phone Number :</span> {profile.phone_number}</p>
              </div>

              <div className="space-y-2 text-gray-700 ml-20">
                <p><span className="font-bold">PAN :</span> {profile.pan_number}</p>
                <p><span className="font-bold">Aadhar Number :</span> {profile.aadhar_number}</p>
                <p><span className="font-bold">Address :</span> {profile.address}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading Profile...</div>
        )}

        {loans.length > 0 ? (
          <div className="mb-10">
            <div className="text-gray-800 text-2xl mb-6 font-bold text-center">
              My Loan Applications
            </div>

            <div className={`grid gap-8 ${loans.length === 1 ? "grid-cols-1 max-w-xl ml-[20%]" : "grid-cols-2 max-w-6xl mx-auto"}`}>
              {loans.map((loan, index) => (
                <div key={index} className="flex flex-col bg-white p-6 rounded-xl shadow-md text-gray-700">
                  <div className="space-y-2">
                    <p><span className="font-bold text-gray-800">Loan Type :</span> {loan.loan_type}</p>
                    <p><span className="font-bold text-gray-800">Amount :</span> {loan.loan_amount}</p>

                    <p>
                      <span className="font-bold text-gray-800">Status :</span>
                      <span className={`ml-2 font-semibold ${loan.status === 'Approved' ? 'text-green-600' : loan.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {loan.status}
                      </span>
                    </p>

                    <p>
                      <span className="font-bold">Applied Date :</span>{" "}
                      {new Date(loan.created_at).toLocaleDateString()}
                    </p>

                    {loan.officer_notes && (
                      <div className="mt-4 p-3 bg-gray-50 border-l-4 border-blue-400 rounded-r-md">
                        <p><span className="font-bold text-gray-800">Officer Remarks :</span> {loan.officer_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No loans applied yet.</p>
        )}
      </div>
    </div>
  );
};

export default Page;