"use client";
import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const Page = () => {
  const router = useRouter();
  
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const[loading,setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(null);
  const [notes, setNotes] = useState('');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };
  const handleProfile = () => {
    router.push('/profile/officer');
  }
  const handleRowClick = (loan) => {
    setSelectedLoan(loan);
    setRiskScore(null);
    setNotes('');
  };

  const handleCalculateRisk = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await API.get(`loans/officer/${selectedLoan.id}/calculate-risk/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const score = res.data.risk_score;
      setRiskScore(score);
      toast.success("Risk Score calculated successfully!");
   
      setLoans(loans.map(loan => 
        loan.id === selectedLoan.id ? { ...loan, risk_score: res.data.risk_score } : loan
      ));

    } catch (error) {
      toast.error(error.response?.data?.error)
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await API.patch(`loans/officer/${selectedLoan.id}/update-status/`, {
        status: newStatus,
        cibil_score: selectedLoan.actual_cibil !== "N/A" ? selectedLoan.actual_cibil : null,
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
      finally{
        setLoading(false);
      }
    };

    fetchAllLoans();
  }, [router]);

  if(loading){
    return(
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    )
  }
  return (
    <div className="relative font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
 
   
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60] py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="w-full sm:w-auto text-center sm:text-left">
             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-900">
               Officer Dashboard
             </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleProfile}
              className="cursor-pointer transition transform hover:-translate-y-1">
              <UserCircleIcon className="w-10 h-10 text-blue-700" />
            </button>
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-full font-bold transition transform hover:-translate-y-1">
              <ArrowRightOnRectangleIcon className="w-9 h-9 text-red-600" />
            </button>
          </div>
        </div>
      </div>

  
      <div className="h-40 sm:h-32"></div>

    
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">

        {selectedLoan ? (
          
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full">
            
            <button
              onClick={() => setSelectedLoan(null)}
              className="mb-4 px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-4xl sm:text-5xl cursor-pointer text-gray-600 hover:text-blue-600 transition hover:-translate-y-1"
            >
              ←
            </button>
            
            <h2 className="mt-2 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl shadow-sm border border-blue-100 text-gray-800">
              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">Applicant Name :</span> {selectedLoan.applicant_name}</p>
                <p><span className="font-bold text-gray-700">Loan Type :</span> {selectedLoan.loan_type}</p>
                <p><span className="font-bold text-gray-700">Loan Amount :</span> ₹{selectedLoan.loan_amount}</p>
                <p><span className="font-bold text-gray-700">Monthly Income : </span>₹{selectedLoan.monthly_income}</p>
                <p><span className="font-bold text-gray-700">Occupation :</span> {selectedLoan.occupation}</p>
              </div>

              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">Applicant ID :</span> {selectedLoan.id}</p>
                <p><span className="font-bold text-gray-700">Tenure :</span> {selectedLoan.tenure} months</p>
                <p><span className="font-bold text-gray-700">Status :</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${selectedLoan.status === 'Approved' ? 'bg-green-100 text-green-700' : selectedLoan.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {selectedLoan.status}
                  </span>
                </p>
                <p><span className="font-bold text-gray-700">CIBIL Score :</span> {selectedLoan.actual_cibil || "N/A"}</p>
                <p><span className="font-bold text-gray-700">Working At :</span> {selectedLoan.organization_name}</p>
              </div>
            </div>

            <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Submitted Documents
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedLoan.id_proof && (
                <div className="bg-red-100 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">ID Proof</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.id_proof} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
              {selectedLoan.address_proof && (
                <div className="bg-red-100 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Address Proof</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.address_proof} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
              {selectedLoan.salary_slips && (
                <div className="bg-red-100 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Salary Slips</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.salary_slips} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
              {selectedLoan.emp_id_card && (
                <div className="bg-red-100 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Employee ID</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.emp_id_card} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
            </div>

           {(selectedLoan.income_proof) && (
              <>
                <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-indigo-600 pl-3 font-bold">
                  Additional Financial Proofs
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selectedLoan.proof_of_oldbank && (
                    <div className="bg-green-100 border border-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-700 mb-2 flex flex-col">Vintage Proof <span className='text-xs font-normal text-gray-500'>(Previous bank history)</span></p>
                      <a className="text-indigo-600 font-normal hover:font-bold hover:text-indigo-800 underline" href={selectedLoan.proof_of_oldbank} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                  {selectedLoan.income_proof && (
                    <div className="bg-green-100 border border-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-700 mb-2">Income Proof (ITR)</p>
                      <a className="text-indigo-600 font-normal hover:font-bold hover:text-indigo-800 underline" href={selectedLoan.income_proof} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                  {selectedLoan.bank_statements && (
                    <div className="bg-green-100 border border-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-700 mb-2">Bank Statements</p>
                      <a className="text-indigo-600 font-normal hover:font-bold hover:text-indigo-800 underline" href={selectedLoan.bank_statements} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                  {selectedLoan.fd_receipts && (
                    <div className="bg-green-100 border border-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-700 mb-2">FD Receipts</p>
                      <a className="text-indigo-600 font-normal hover:font-bold hover:text-indigo-800 underline" href={selectedLoan.fd_receipts} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                  {selectedLoan.pending_loan_docs && (
                    <div className="bg-green-100 border border-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-700 mb-2">Pending Loan Reports</p>
                      <a className="text-indigo-600 font-normal hover:font-bold hover:text-indigo-800 underline" href={selectedLoan.pending_loan_docs} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                </div>
              </>
            )}

            <h4 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Nominee Details
            </h4>
            <span className="block m-1 text-red-600 text-lg sm:text-xl font-medium">Nominee Name: {selectedLoan.nominee_name || 'N/A'}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedLoan.nominee_id_card && (
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Nominee ID Proof</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.nominee_id_card} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
              {selectedLoan.nominee_address_proof && (
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Nominee Address Proof</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.nominee_address_proof} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
              {selectedLoan.nominee_sign && (
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-gray-700 mb-2">Nominee Signature</p>
                  <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline" href={selectedLoan.nominee_sign} target="_blank" rel="noopener noreferrer">View Document</a>
                </div>
              )}
            </div>
          
            <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Risk Assessment
            </h3>

            <button
              onClick={handleCalculateRisk}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer font-bold hover:bg-blue-800 transition transform hover:-translate-y-1 w-full sm:w-auto shadow-md"
            >
              Calculate Risk Score
            </button>

            {riskScore && (
              <div className={`mt-6 p-5 rounded-xl text-white shadow-md max-w-full ${
                                        riskScore === 'high' ? 'bg-red-600' : 
                                        riskScore === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                    }`}>
                <p className="text-lg"><span className="font-bold">Prediction:</span> <span className='font-bold capitalize ml-2'>{riskScore} Risk</span></p>
              </div>
            )}

            <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Officer Decision
            </h3>

            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any remarks or internal notes here..."
              className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleStatusUpdate('Approved')}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition transform hover:-translate-y-1 shadow-md w-full sm:w-auto text-center cursor-pointer"
              >
                Approve Loan
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-1 shadow-md w-full sm:w-auto text-center cursor-pointer"
              >
                Reject Loan
              </button>
            </div>

          </div>

        ) : (

          
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full">
            <h2 className="mb-8 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Active Loan Applications
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[600px] border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-700 border-b border-gray-200">
                    <th className="p-4 font-bold">Applicant Name</th>
                    <th className="p-4 font-bold">Amount</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length > 0 ? (
                    loans.map((loan) => (
                      <tr key={loan.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                        <td className="p-4 font-medium text-gray-800">{loan.applicant_name || "Unknown"}</td>
                        <td className="p-4 text-gray-700">₹{loan.loan_amount}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                            loan.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                            loan.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleRowClick(loan)}
                            className="bg-blue-600 cursor-pointer text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-sm hover:-translate-y-0.5"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-8 text-gray-500 font-medium italic">
                        No active applications found.
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