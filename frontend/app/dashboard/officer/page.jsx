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
  const handleProfile = () => {
    router.push('/profile/officer');
  }
  const handleRowClick = (loan) => {
    console.log(loan);
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
    };

    fetchAllLoans();
  }, [router]);

  return (
    <div className="relative font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
 
  <div className="fixed top-0 left-0 w-full h-10 bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60]"></div>

      <div className="w-full p-10 font-sans">

        
        <div className="fixed top-0 left-0 w-full h-24 bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60] flex items-center justify-center">
  <div className="w-full bg-white shadow-xl rounded-xl p-6 flex justify-between items-center">
    
    <div className="flex-1">
       <h1 className="text-3xl font-semibold text-blue-900 text-center ml-40">
         Officer Dashboard
       </h1>
    </div>

    
    <div className="flex gap-4">
      <button
        onClick={handleProfile}
        className="bg-indigo-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition transform hover:-translate-y-1 shadow-md"
      >
        Profile
      </button>

      <button
        onClick={handleLogout}
        className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition transform hover:-translate-y-1 shadow-md"
      >
        Logout
      </button>
    </div>
  </div>
</div>


<div className="h-16 mb-4"></div>

        {selectedLoan ? (

          <div className="bg-white shadow-md rounded-4xl p-10 px-90">

            
            <button
              onClick={() => setSelectedLoan(null)}
              className="mb-4 px-4 py-2 rounded-lg text-6xl cursor-pointer transition hover:-translate-y-1"
            >
              ←
            </button>

            
            <h2 className="mt-4 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Application Details
            </h2>

            <div className="grid grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl shadow-md text-gray-800">

              <div className="space-y-2">
                <p><span className="font-bold">Applicant Name :</span> {selectedLoan.applicant_name}</p>
                <p><span className="font-bold">Loan Type :</span> {selectedLoan.loan_type}</p>
                <p><span className="font-bold">Loan Amount :</span> ₹{selectedLoan.loan_amount}</p>
                <p><span className="font-bold">Monthly Income : </span>₹{selectedLoan.monthly_income}</p>
                <p><span className="font-bold">Occupation :</span> {selectedLoan.occupation}</p>
              </div>

              <div className="space-y-2">
                <p><span className="font-bold">Applicant ID :</span> {selectedLoan.id}</p>
                <p><span className="font-bold">Tenure :</span> {selectedLoan.tenure} months</p>
                <p><span className="font-bold">Status :</span> {selectedLoan.status}</p>
                <p><span className="font-bold">CIBIL Score :</span> {selectedLoan.actual_cibil || "N/A"}</p>
                <p><span className="font-bold">Working At :</span> {selectedLoan.organization_name}</p>
              </div>

            </div>

            
            <h3 className="mt-6 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Submitted Documents
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {selectedLoan.id_proof && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">ID Proof</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.id_proof} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.address_proof && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Address Proof</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.address_proof} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.salary_slips && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Salary Slips</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.salary_slips} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.emp_id_card && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Employee ID</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.emp_id_card} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              )}

            </div>

           {(selectedLoan.income_proof) && (
              <>
                <h3 className="mt-8 mb-4 text-gray-800 text-2xl border-l-4 border-indigo-600 pl-2 font-bold">
                  Additional Financial Proofs
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  {selectedLoan.proof_of_oldbank && (
                    <div className="bg-gradient-to-r from-white to-cyan-400 border border-indigo-200 p-4 rounded-xl shadow-sm">
                      <p className="font-bold text-gray-700 mb-2">Vintage Proof</p>
                      <a className="text-indigo-600 hover:font-bold" href={selectedLoan.proof_of_oldbank} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  )}

                  {selectedLoan.income_proof && (
                    <div className="bg-gradient-to-r from-cyan-400 to-white border border-indigo-200 p-4 rounded-xl shadow-sm">
                      <p className="font-bold text-gray-700 mb-2">Income Proof</p>
                      <a className="text-indigo-600 hover:font-bold" href={selectedLoan.income_proof} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  )}

                  {selectedLoan.bank_statements && (
                    <div className="bg-gradient-to-r from-white to-cyan-400 border border-indigo-200 p-4 rounded-xl shadow-sm">
                      <p className="font-bold text-gray-700 mb-2">Bank Statements</p>
                      <a className="text-indigo-600 hover:font-bold" href={selectedLoan.bank_statements} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  )}

                  {selectedLoan.fd_receipts && (
                    <div className="bg-gradient-to-r from-cyan-400 to-white border border-indigo-200 p-4 rounded-xl shadow-sm">
                      <p className="font-bold text-gray-700 mb-2">FD Receipts</p>
                      <a className="text-indigo-600 hover:font-bold" href={selectedLoan.fd_receipts} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  )}
                </div>
                {selectedLoan.pending_loan_docs && (
                    <div className="bg-gradient-to-r from-cyan-300 to-white border border-indigo-200 p-4 rounded-xl shadow-sm w-full flex justify-center items-center flex-col">
                      <p className="font-bold text-gray-700 mb-2">Pending Loan Reports</p>
                      <a className="text-indigo-600 hover:font-bold" href={selectedLoan.pending_loan_docs} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  )}
              </>
            )}

            <h4 className="mt-6 mb-3 text-gray-700 text-2xl font-bold">
              Nominee Details: <br></br> <span className="text-blue-600 text-xl">Nominee Name : {selectedLoan.nominee_name || 'N/A'}</span>
            </h4>
            
            <div className="grid grid-cols-3 gap-4">

              {selectedLoan.nominee_id_card && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Nominee ID Proof</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.nominee_id_card} target="_blank">
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.nominee_address_proof && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Nominee Address Proof</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.nominee_address_proof} target="_blank">
                    View Document
                  </a>
                </div>
              )}

              {selectedLoan.nominee_sign && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">Nominee Signature</p>
                  <a className="text-blue-600 hover:font-bold" href={selectedLoan.nominee_sign} target="_blank">
                    View Document
                  </a>
                </div>
              )}

            </div>
          
            <h3 className="mt-8 mb-4 text-gray-800 text-2xl border-l-4 border-blue-600 pl-2 font-bold">
              Risk Assessment
            </h3>

            <button
              onClick={handleCalculateRisk}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer font-bold hover:bg-blue-800 transition transform hover:-translate-y-1"
            >
              Calculate Risk Score
            </button>

            {riskScore && (
              <div  className={`mt-4 p-4 rounded-lg text-white ${
                                        riskScore === 'high'
                                        ? 'bg-red-600'
                                        : riskScore === 'medium'
                                        ? 'bg-orange-400'
                                        : 'bg-green-500'
                                    }`}>
                <p><span className="font-bold">Prediction :</span> <span className='font-bold capitalize'>{riskScore} risk</span></p>
              </div>
            )}

            
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

          <div className="bg-white shadow-md rounded-4xl px-65 py-10">

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