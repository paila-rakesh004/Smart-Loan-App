"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const Page = () => {
  const router = useRouter();
  
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [sure,setSure] = useState(false);
  const [status,setStatus] = useState('Eligible');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_officer');
    router.push('/login');
  };
  
  const handleProfile = () => {
    router.push('/profile/officer');
  }

  const handleRowClick = async (loan) => {
    setSelectedLoan(loan);
    setRiskScore(null);
    setNotes('');

    try {
      
      const res = await API.get(`loans/officer/${loan.id}/recalculate-cibil/`);
      
      const freshScore = res.data.new_cibil_score;
      setSelectedLoan(prev => ({ ...prev, actual_cibil: freshScore }));
      setLoans(loans.map(l => l.id === loan.id ? { ...l, actual_cibil: freshScore } : l));
      toast.success("Cibil Score Calculated");
    } catch (error) {
      console.error("Failed to fetch live CIBIL score.");
    }
  };

  const handleCalculateRisk = async () => {
    try {
      const res = await API.get(`loans/officer/${selectedLoan.id}/calculate-risk/`);
      const score = res.data.risk_score;
      setRiskScore(score);
      toast.success("Risk Score calculated successfully!");
      setLoans(loans.map(loan => loan.id === selectedLoan.id ? { ...loan, risk_score: res.data.risk_score } : loan));
    } catch (error) {
      toast.error(error.response?.data?.error)
    }
  };

  const confirmUpdate = async (newStatus) => {
    try {
      
      await API.patch(`loans/officer/${selectedLoan.id}/update-status/`, {
        status: newStatus,
        cibil_score: selectedLoan.actual_cibil !== "N/A" ? selectedLoan.actual_cibil : null,
        officer_notes: notes,
        risk_score: riskScore
      });

      toast.success(`Applicant is ${newStatus} for loan approval!`);
      setLoans(loans.map(loan => loan.id === selectedLoan.id ? { ...loan, status: newStatus } : loan));
      setSelectedLoan(null);
      
    } catch (error) {
      console.error(error);
      toast.error("Error updating application status.");
    }
    finally{
      setSure(false);
    }
  }

  const handleEligible = () => {
    setSure(true);
    setStatus('Eligible');
    console.log(sure); 
  };
  const handleNotEligible = () => {
    setSure(true);
    setStatus('Not Eligible');
    console.log(sure); 
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const isOfficer = localStorage.getItem('is_officer');
    if (isOfficer !== 'true') {
      toast.error("Security Alert: Unauthorized Access");
      router.push('/dashboard/customer');
      return;
    }

    const fetchAllLoans = async () => {
      try {
        const res = await API.get('loans/officer/all-loans/');
        setLoans(res.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 403) {
            router.push('/dashboard/customer');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllLoans();
  }, [router]);

  

  const renderOfficerAIBadge = (documentKey) => {
    if (!selectedLoan.ai_verification_data || !selectedLoan.ai_verification_data[documentKey]) {
      return null; 
    }
    const aiData = selectedLoan.ai_verification_data[documentKey];

    if (aiData.decision === "AUTO_APPROVE") {
      return (
        <div className="mt-2 bg-green-50 border border-green-200 p-2 rounded-lg">
          <p className="text-xs font-bold text-green-700">✨ AI Pre-Screened: Verified ({aiData.confidence}%)</p>
        </div>
      );
    }
    if (aiData.decision === "MANUAL_REVIEW") {
      return (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded-lg">
          <p className="text-xs font-bold text-yellow-700">⚠️ AI Flagged for Review ({aiData.confidence}%)</p>
          <p className="text-xs text-yellow-600 mt-1 italic">{aiData.reasoning}</p>
        </div>
      );
    }
    return null;
  };

 
  const DocumentCard = ({ title, url, badgeKey, colorClass = "bg-gray-50 border-gray-200" }) => {
    if (!url) return null;
    return (
      <div className={`${colorClass} border p-5 rounded-xl shadow-sm hover:shadow-md transition`}>
        <p className="font-bold text-gray-700 mb-2">{title}</p>
        <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline block mb-2" href={url} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
        {badgeKey && renderOfficerAIBadge(badgeKey)}
      </div>
    );
  };

 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
        <div className="w-15 h-15 border-6 border-t-blue-700 border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="relative z-0 font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
        
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-50 py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto text-center sm:text-left">
             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-900">
               Officer Dashboard
             </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={handleProfile} className="cursor-pointer transition transform hover:-translate-y-1">
              <UserCircleIcon className="w-10 h-10 text-blue-700" />
            </button>
            <button onClick={handleLogout} className="cursor-pointer rounded-full font-bold transition transform hover:-translate-y-1">
              <ArrowRightOnRectangleIcon className="w-9 h-9 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-40 sm:h-32"></div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        {selectedLoan ? (
          
          <div className={`${sure ? 'blur-sm pointer-events-none z-0 fixed' : 'bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full relative '}`}>
            
            <button onClick={() => setSelectedLoan(null)} className="mb-4 px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-4xl sm:text-5xl cursor-pointer text-gray-600 hover:text-blue-600 transition hover:-translate-y-1">
              ←
            </button>
            
            <h2 className="mt-2 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl shadow-sm border border-blue-100 text-gray-800">
              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">Applicant Name :</span> {selectedLoan.applicant_name || `User ID: ${selectedLoan.user}`}</p>
                <p><span className="font-bold text-gray-700">Age:</span> {selectedLoan.applicant_age}</p>
                <p><span className="font-bold text-gray-700">Loan Type :</span> {selectedLoan.loan_type}</p>
                <p><span className="font-bold text-gray-700">Loan Amount :</span> ₹{selectedLoan.loan_amount}</p>
                <p><span className="font-bold text-gray-700">Monthly Income : </span>₹{selectedLoan.monthly_income}</p>
                <p><span className="font-bold text-gray-700">Occupation Type :</span> {selectedLoan.occupation}</p>
                <p><span className="font-bold text-gray-700">Occupation :</span> {selectedLoan.occ}</p>
              </div>

              <div className="space-y-3">
                <p><span className="font-bold text-gray-700">Applicant ID :</span> {selectedLoan.id}</p>
                <p><span className="font-bold text-gray-700">Tenure :</span> {selectedLoan.tenure} months</p>
                <p><span className="font-bold text-gray-700">Status :</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${selectedLoan.status === 'Eligible' ? 'bg-green-100 text-green-700' : selectedLoan.status === 'Not Eligible' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {selectedLoan.status}
                  </span>
                </p>
                
                <div className="space-y-3 mt-4">
                   <p><span className="font-bold text-gray-700">Live CIBIL Score :</span> <span className={selectedLoan.actual_cibil < 600 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{selectedLoan.actual_cibil || "N/A"}</span></p>
                   <p><span className="font-bold text-gray-700">Total Transactions :</span> ₹{selectedLoan.total_transaction_amount || 0}</p>
                   <p><span className="font-bold text-gray-700">Fixed Deposits :</span> ₹{selectedLoan.fixed_deposits || 0}</p>
                   <p><span className="font-bold text-gray-700">Working At :</span> {selectedLoan.organization_name}</p>
                </div>
              </div>
            </div>

            <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              General KYC Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DocumentCard title="PAN Card" url={selectedLoan.pan_card_file} badgeKey="panCard" colorClass="bg-red-50 border-red-200" />
              <DocumentCard title="Aadhaar Card" url={selectedLoan.aadhar_card_file} badgeKey="aadharCard" colorClass="bg-red-50 border-red-200" />
              <DocumentCard title="Passport Photo" url={selectedLoan.passport_photo} colorClass="bg-red-50 border-red-200" />
            </div>

            {(selectedLoan.itr_document || selectedLoan.bank_statements || selectedLoan.salary_slips || selectedLoan.emp_id_card) && (
              <>
                <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-indigo-600 pl-3 font-bold">
                  Employment & Financial Proofs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <DocumentCard title="Bank Statements" url={selectedLoan.bank_statements} badgeKey="bankStatements" colorClass="bg-green-50 border-indigo-200" />
                  <DocumentCard title="Income Proof (ITR)" url={selectedLoan.itr_document} badgeKey="itrDocument" colorClass="bg-green-50 border-indigo-200" />
                  <DocumentCard title="Salary Slips" url={selectedLoan.salary_slips} badgeKey="salarySlips" colorClass="bg-green-50 border-indigo-200" />
                  <DocumentCard title="Employee ID" url={selectedLoan.emp_id_card} badgeKey="empIdCard" colorClass="bg-green-50 border-indigo-200" />
                </div>
              </>
            )}

            {selectedLoan.loan_type === 'Education' && (
              <>
                <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-indigo-600 pl-3 font-bold">
                  Academic Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <DocumentCard title="10th Certificate" url={selectedLoan.doc_10th_cert} badgeKey="doc10thCert" colorClass="bg-indigo-50 border-indigo-200" />
                  <DocumentCard title="12th Certificate" url={selectedLoan.doc_12th_cert} badgeKey="doc12thCert" colorClass="bg-indigo-50 border-indigo-200" />
                  <DocumentCard title="Degree Certificate" url={selectedLoan.doc_degree_cert} badgeKey="docDegreeCert" colorClass="bg-indigo-50 border-indigo-200" />
                  <DocumentCard title="Admission Letter" url={selectedLoan.doc_admission_letter} badgeKey="docAdmissionLetter" colorClass="bg-indigo-50 border-indigo-200" />
                  <DocumentCard title="Fee Structure" url={selectedLoan.doc_fee_structure} badgeKey="docFeeStructure" colorClass="bg-indigo-50 border-indigo-200" />
                </div>
              </>
            )}

        
            {selectedLoan.loan_type === 'Home' && (
              <>
                <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-emerald-600 pl-3 font-bold">
                  Property Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <DocumentCard title="Agreement to Sale" url={selectedLoan.doc_agreement_sale} badgeKey="docAgreementSale" colorClass="bg-emerald-50 border-emerald-200" />
                  <DocumentCard title="No Objection Certificate" url={selectedLoan.doc_noc} badgeKey="docNoc" colorClass="bg-emerald-50 border-emerald-200" />
                  <DocumentCard title="Encumbrance Certificate" url={selectedLoan.doc_encumbrance_cert} colorClass="bg-emerald-50 border-emerald-200" />
                  <DocumentCard title="Building Plan" url={selectedLoan.doc_building_plan} colorClass="bg-emerald-50 border-emerald-200" />
                </div>
              </>
            )}

            <div className="mt-8 mb-8 bg-gray-50 border border-gray-200 p-4 rounded-xl text-center shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500">
                <span className="font-bold text-gray-700">Note:</span> The &quot;AI Pre-Screened&quot; tags are generated by automated LLM analysis. Please reverify flagged documents for quality assurance purposes.
              </p>
            </div>

           
            <h4 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
              Co-Applicant / Guarantor Details
            </h4>
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-6">
              <p><span className="font-bold text-gray-700">Name:</span> {selectedLoan.nominee_name || 'N/A'}</p>
              <p><span className="font-bold text-gray-700">Age:</span> {selectedLoan.nominee_age || 'N/A'}</p>
              {selectedLoan.guarantor_income && <p><span className="font-bold text-gray-700">Guarantor Income:</span> ₹{selectedLoan.guarantor_income}</p>}
              {selectedLoan.guarantor_organization && <p><span className="font-bold text-gray-700">Guarantor Employer:</span> {selectedLoan.guarantor_organization}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> 
              <DocumentCard title="Guarantor KYC" url={selectedLoan.doc_guarantor_kyc}  colorClass="bg-blue-50 border-blue-200" />
              <DocumentCard title="Guarantor Financials" url={selectedLoan.doc_guarantor_financials} colorClass="bg-blue-50 border-blue-200" />
              <DocumentCard title="Guarantor Photo" url={selectedLoan.doc_guarantor_photo} colorClass="bg-blue-50 border-blue-200" />
              <DocumentCard title="Guarantor Signature" url={selectedLoan.doc_guarantor_signature} colorClass="bg-blue-50 border-blue-200" />
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
                  riskScore === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
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
                onClick={() => handleEligible()}
                disabled={selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible'}
                className={` text-white px-8 py-3 rounded-xl font-bold  shadow-md w-full sm:w-auto text-center ${selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 cursor-pointer hover:bg-red-600 transition transform hover:-translate-y-1'}`}
              >
                 Eligible for Loan
              </button>
              <button
                onClick={() => handleNotEligible()}
                disabled={selectedLoan.status === 'Not Eligible' || selectedLoan.status === 'Eligible'}
                className={` text-white px-8 py-3 rounded-xl font-bold  shadow-md w-full sm:w-auto text-center ${selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible'  ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 cursor-pointer hover:bg-red-600 transition transform hover:-translate-y-1'}`}
              >
                 Not Eligible for Loan
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
                        <td className="p-4 font-medium text-gray-800">{loan.applicant_name || `User ID: ${loan.user}`}</td>
                        <td className="p-4 text-gray-700">₹{loan.loan_amount}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                            loan.status === 'Eligible' ? 'bg-green-100 text-green-700' : 
                            loan.status === 'Not Eligible' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
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
      {sure && (
                <div className='flex flex-col items-center justify-center gap-5 w-70 h-40 z-10 bg-white shadow-md rounded-4xl p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 '>
                    <div className='text-3xl'>Are you Sure ? </div>
                        <div className='flex gap-8'>
                            <button className='rounded text-xl w-10 h-8 text-white bg-blue-500 cursor-pointer hover:bg-indigo-800'
                             onClick={() => confirmUpdate(status)}>Yes</button>
                            <button className='rounded text-xl w-10 h-8 text-white bg-red-500 cursor-pointer hover:bg-red-800'
                             onClick={() => setSure(false)}>No</button>
                        </div>
                  </div>
              )}
    </div>
  );
};

export default Page;