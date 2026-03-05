"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

const Page = () => {
  const router = useRouter();
  
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  const [riskScore, setRiskScore] = useState(null);
  const [notes, setNotes] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const handleRowClick = (loan) => {
    setSelectedLoan(loan);
    setRiskScore(loan.risk_score || null);
    setNotes(loan.officer_notes || '');
  };

  const handleCalculateRisk = () => {
    alert("ML Model Not Integrated yet");
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await API.patch(`loans/officer/${selectedLoan.id}/update-status/`, {
        status: newStatus,
        cibil_score: selectedLoan.cibil_score !== "N/A" ? selectedLoan.cibil_score : null,
        officer_notes: notes,
        risk_score: riskScore
      }, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success(`Application has been ${newStatus}!`);
      
      setLoans(loans.map(loan => 
        loan.id === selectedLoan.id ? { ...loan, status: newStatus } : loan
      ));
      
      setSelectedLoan(null);
      
    } catch (error) {
      console.error(error);
      alert("Error updating application status.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAllLoans = async () => {
      try {
        const res = await API.get('loans/officer/all-loans/', {
          headers: { Authorization: `Token ${token}` },
        });
        setLoans(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllLoans();
  }, [router]);

  return (
    <div className="flex items-center justify-center font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen">

      <div className="w-[900px] p-10 font-sans">

        {/* Header */}
        <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-semibold text-blue-900">
            Officer Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition transform hover:-translate-y-1"
          >
            Logout
          </button>
        </div>

        {selectedLoan ? (

          <div className="bg-white shadow-md rounded-xl p-6">

            {/* Back Button */}
            <button
              onClick={() => setSelectedLoan(null)}
              className="mb-4 px-4 py-2 rounded-lg text-2xl cursor-pointer hover:bg-red-500 transition"
            >
              🔙
            </button>

            {/* Applicant Details */}
            <h2 className="mt-4 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Application Details
            </h2>

            <div className="grid grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl shadow-md text-gray-800">

              <div className="space-y-2">
                <p><span className="font-bold">Applicant Name :</span> {selectedLoan.applicant_name}</p>
                <p><span className="font-bold">Loan Type :</span> {selectedLoan.loan_type}</p>
                <p><span className="font-bold">Loan Amount :</span> ₹{selectedLoan.loan_amount}</p>
              </div>

              <div className="space-y-2">
                <p><span className="font-bold">Tenure :</span> {selectedLoan.tenure} months</p>
                <p><span className="font-bold">Status :</span> {selectedLoan.status}</p>
                <p><span className="font-bold">CIBIL Score :</span> {selectedLoan.cibil_score}</p>
              </div>

            </div>

            {/* Submitted Documents */}
            <h3 className="mt-6 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Submitted Documents
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {selectedLoan.id_proof && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">ID Proof</p>
                  <a
                    className="text-blue-600 hover:font-bold"
                    href={selectedLoan.id_proof}
                    target="_blank"
                  >
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.address_proof && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Address Proof</p>
                  <a
                    className="text-blue-600 hover:font-bold"
                    href={selectedLoan.address_proof}
                    target="_blank"
                  >
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.salary_slips && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Salary Slips</p>
                  <a
                    className="text-blue-600 hover:font-bold"
                    href={selectedLoan.salary_slips}
                    target="_blank"
                  >
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.emp_id_card && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Employee ID</p>
                  <a
                    className="text-blue-600 hover:font-bold"
                    href={selectedLoan.emp_id_card}
                    target="_blank"
                  >
                    View Document
                  </a>
                </div>
              )}

            </div>

            {/* Risk Section */}
            <h3 className="mt-6 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Risk Assessment (ML Model)
            </h3>

            <button
              onClick={handleCalculateRisk}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition transform hover:-translate-y-1"
            >
              Calculate Risk Score
            </button>

            {riskScore && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><span className="font-bold">Model Prediction :</span> {riskScore}</p>
              </div>
            )}

            {/* Officer Decision */}
            <h3 className="mt-6 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Officer Decision
            </h3>

            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any remarks here..."
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="mt-6 flex gap-6">

              <button
                onClick={() => handleStatusUpdate('Approved')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition transform hover:-translate-y-1"
              >
                Approve Loan
              </button>

              <button
                onClick={() => handleStatusUpdate('Rejected')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition transform hover:-translate-y-1"
              >
                Reject Loan
              </button>

            </div>

          </div>

        ) : (

          <div className="bg-white shadow-md rounded-xl p-6">

            <h2 className="mt-2 mb-6 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Loan Applications
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Loan Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {loans.length > 0 ? (
                    loans.map((loan) => (
                      <tr key={loan.id} className="border-b hover:bg-gray-50">

                        <td className="p-3">{loan.applicant_name || "Unknown"}</td>
                        <td className="p-3">₹{loan.loan_amount}</td>
                        <td className="p-3">{loan.status}</td>

                        <td className="p-3">
                          <button
                            onClick={() => handleRowClick(loan)}
                            className="bg-blue-600 cursor-pointer text-white px-4 py-1 rounded-lg hover:bg-blue-800 transition transform hover:-translate-y-1"
                          >
                            Review
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-4 text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default Page;