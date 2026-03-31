"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';


export default function ApplyLoan() {
  const router = useRouter();
  const [isNewUser, setIsNewUser] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [click, setClick] = useState(false);

  const [aiStatuses, setAiStatuses] = useState({});
  const [isNameLocked, setIsNameLocked] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    organizationName: "",
    monthlyIncome: "",
    LoanType: "",
    tenure: "",
    loanAmount: "",
    idproof: null,
    addressProof: null,
    salarySlips: null,
    EmpIDcard: null,
    nomineeName: "",
    nomineeIDcard: null,
    nomineeAddressproof: null,
    nomineesign: null,
    yearsAtPreviousBank: "",
    totalTransactionAmount: "",
    fixedDepositsAmount: "",
    pendingLoansAmount: "",
    proofOfOldbank: null,
    incomeProof: null,
    bankStatements: null,
    fdReceipts: null,
    pendingLoanDocs: null,
  });

  const isFarmer = form.occupation.trim().toLowerCase() === "farmer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handlevalueChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLockIdentity = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter both First and Last Name.");
      return;
    }
    setIsNameLocked(true);
    toast.success("Legal identity confirmed & locked for AI verification.");
  };

  const verifyDocumentWithAI = async (fieldName, file, inputElement) => {
    setAiStatuses((prev) => ({ ...prev, [fieldName]: { loading: true } }));

    const documentTypeMap = {
      idproof: "PAN Card",
      addressProof: "Aadhaar Card",
      salarySlips: "Salary Slip",
      EmpIDcard: "Employee ID",
      incomeProof: "ITR",
      proofOfOldbank: "Vintage Proof",
      bankStatements: "Bank Statement",
      fdReceipts: "FD Receipt",
      pendingLoanDocs: "Pending Loan Report"
    };

    const expectedDocType = documentTypeMap[fieldName] || "Unknown";



    const formData = new FormData();
    formData.append("document", file);
    
    formData.append("first_name", form.firstName);
    formData.append("last_name", form.lastName);
    formData.append("organization_name", form.organizationName);
    formData.append("monthly_income", form.monthlyIncome);
    formData.append("years_at_previous_bank", form.yearsAtPreviousBank);
    formData.append("expected_doc_type", expectedDocType);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post("loans/verify-document/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { decision, confidence_score, ai_reasoning } = res.data;
      const scorePct = (confidence_score * 100).toFixed(0);

      setAiStatuses((prev) => ({
        ...prev,
        [fieldName]: {
          loading: false,
          decision: decision,
          confidence: scorePct,
          reasoning: ai_reasoning,
        },
      }));

      if (decision === "REJECTED_PLEASE_REUPLOAD") {
        toast.error(`Document Rejected: ${ai_reasoning}`);
        setForm((prev) => ({ ...prev, [fieldName]: null }));
        if (inputElement) inputElement.value = "";
      }
    } catch (error) {
      setAiStatuses((prev) => ({
        ...prev,
        [fieldName]: {
          loading: false,
          decision: "MANUAL_REVIEW",
          reasoning: "AI scan failed or format unsupported. Will be manually reviewed.",
        },
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    if (!file) return;

    const aiWorthyDocs = ["idproof", "addressProof", "salarySlips", "EmpIDcard", "incomeProof", "proofOfOldbank","bankStatements","fdReceipts","pendingLoanDocs"];

    if (aiWorthyDocs.includes(fieldName)) {
      if (!form.firstName || !form.lastName) {
        toast.error("Please enter and lock your Legal First and Last Name before uploading documents!");
        e.target.value = ""; 
        return;
      }
    }

    if (fieldName === "salarySlips" || fieldName === "EmpIDcard") {
      if (!form.organizationName || !form.monthlyIncome) {
        toast.error("Please enter your Organization and Monthly Income first!");
        e.target.value = "";
        return;
      }
    }

    if (fieldName === "proofOfOldbank" && !form.yearsAtPreviousBank) {
      toast.error("Please enter 'Years at Previous Bank' before uploading vintage proof!");
      e.target.value = ""; 
      return;
    }

    setForm({ ...form, [fieldName]: file });

    if (aiWorthyDocs.includes(fieldName)) {
      verifyDocumentWithAI(fieldName, file, e.target);
    }
  };

  const handleProfile = () => {
    router.push("/profile/customer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in!");
      return;
    }

    const isAiLoading = Object.values(aiStatuses).some((status) => status.loading);
    if (isAiLoading) {
      toast.warning("Please wait for AI verification to complete.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("occupation", form.occupation);
    dataToSend.append("organization_name", form.organizationName);
    dataToSend.append("monthly_income", form.monthlyIncome);
    dataToSend.append("loan_amount", form.loanAmount);
    dataToSend.append("loan_type", form.LoanType);
    dataToSend.append("tenure", form.tenure);
    dataToSend.append("nominee_name", form.nomineeName);

    if (form.idproof) dataToSend.append("id_proof", form.idproof);
    if (form.addressProof) dataToSend.append("address_proof", form.addressProof);
    if (form.salarySlips) dataToSend.append("salary_slips", form.salarySlips);
    if (form.EmpIDcard && !isFarmer) dataToSend.append("emp_id_card", form.EmpIDcard);
    if (form.nomineeIDcard) dataToSend.append("nominee_id_card", form.nomineeIDcard);
    if (form.nomineeAddressproof) dataToSend.append("nominee_address_proof", form.nomineeAddressproof);
    if (form.nomineesign) dataToSend.append("nominee_sign", form.nomineesign);

    if (isNewUser) {
      dataToSend.append("years_at_previous_bank", form.yearsAtPreviousBank);
      dataToSend.append("annual_income", form.monthlyIncome * 12);
      dataToSend.append("total_transaction_amount", form.totalTransactionAmount);
      dataToSend.append("fixed_deposits_amount", form.fixedDepositsAmount);
      dataToSend.append("pending_loans_amount", form.pendingLoansAmount);
      if (form.proofOfOldbank) dataToSend.append("proof_of_oldbank", form.proofOfOldbank);
      if (form.incomeProof) dataToSend.append("income_proof", form.incomeProof);
      if (form.bankStatements) dataToSend.append("bank_statements", form.bankStatements);
      if (form.fdReceipts) dataToSend.append("fd_receipts", form.fdReceipts);
      if (form.pendingLoanDocs) dataToSend.append("pending_loan_docs", form.pendingLoanDocs);
    }
    dataToSend.append("ai_statuses", JSON.stringify(aiStatuses));
    setClick(true);
    try {
      const endpoint = isNewUser ? "loans/apply-new-user/" : "loans/apply/";
      await API.post(endpoint, dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Loan submitted successfully!");
      router.push("/dashboard/customer");
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setClick(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const checkUserStatus = async () => {
      try {
        const res = await API.get("users/check-status/", {
          headers: { Authorization: `Token ${token}` },
        });
        
        setIsNewUser(res.data.is_new_user);

        if (res.data.first_name || res.data.last_name) {
          setForm((prev) => ({
            ...prev,
            firstName: res.data.first_name || "",
            lastName: res.data.last_name || "",
          }));
          setIsNameLocked(true); 
        }

      } catch (error) {
        toast.error("Failed to fetch user status");
      } finally {
        setLoadingStatus(false);
      }
    };
    checkUserStatus();
  }, [router]);

  const isSubmitDisabled = click || Object.values(aiStatuses).some(s => s.loading) || Object.values(aiStatuses).some(s => s.decision === 'REJECTED_PLEASE_REUPLOAD');

  if (loadingStatus) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
        <div className="w-15 h-15 border-6 border-indigo-500 border-b-transparent rounded-full animate-ping"></div>
      </div>
    );
  }

  const renderAIBadge = (fieldName) => {
    const status = aiStatuses[fieldName];
    if (!status) return null;

    if (status.loading) {
      return <p className="text-sm font-semibold text-blue-600 animate-pulse mt-1">⏳ AI is scanning document...</p>;
    }
    if (status.decision === "AUTO_APPROVE") {
      return (
        <div className="mt-1">
          <p className="text-sm font-bold text-green-600">✅ AI Approved (Confidence: {status.confidence}%)</p>
        </div>
      );
    }
    if (status.decision === "MANUAL_REVIEW") {
      return (
        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-semibold text-yellow-700">⚠️ Flagged for manual review</p>
          <p className="text-xs text-yellow-600 mt-1 ">AI Notes: {status.reasoning}</p>
        </div>
      );
    }
    if (status.decision === "REJECTED_PLEASE_REUPLOAD") {
      return (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-bold text-red-600">❌ Invalid Document. Please reupload.</p>
          <p className="text-xs text-red-500 mt-1 ">Reason: {status.reasoning}</p>
        </div>
      );
    }
    return null;
  };

  const baseDocuments = [
    { label: "PAN Card (ID Proof)", name: "idproof" },
    { label: "Aadhaar Card (Front & Back)", name: "addressProof" },
    { label: "Salary Slips", name: "salarySlips" },
  ];
  
  const documentsToRender = isFarmer ? baseDocuments : [...baseDocuments, { label: "Employee ID Card", name: "EmpIDcard" }];

  return (
    <div className="font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
      
      
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60] py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex justify-center md:justify-start">
             <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-900 text-center">Loan Application</h1>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button type="button" onClick={() => router.push("/dashboard/customer")} 
            className="cursor-pointer mr-45 md:m-0 transition transform hover:-translate-y-1">
              <ArrowLeftIcon className="w-7 h-7 text-gray-700" />
            </button>
            <button type="button" onClick={handleProfile} 
            className="cursor-pointer rounded-full transition transform hover:-translate-y-1 ">
              <UserCircleIcon className="w-10 h-10 text-blue-700" />
            </button>
            
            <button type="button" onClick={handleLogout} 
            className="cursor-pointer font-bold transition transform hover:-translate-y-1">
                <ArrowRightOnRectangleIcon className="w-9 h-9 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      
      <div className="h-44 md:h-32"></div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        <div className="bg-white shadow-lg rounded-2xl sm:rounded-[2rem] p-6 sm:p-10">
          
          <div className="mb-8 sm:mb-10 text-center">
             <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Submit Your Request</h2>
             <p className="text-gray-500 mt-2 text-sm sm:text-base ">Please fill in all the details accurately for faster processing.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
            
            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">
                Legal Identity <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-500 sm:ml-2 mt-1 sm:mt-0">(Must match your PAN/Aadhaar exactly)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">First Name</label>
                  <input 
                    name="firstName" 
                    value={form.firstName}
                    placeholder="e.g., Name" 
                    onChange={handlevalueChange} 
                    disabled={isNameLocked}
                    className={`p-3 rounded-lg border border-gray-300 outline-none transition w-full ${isNameLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white'}`} 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Last Name</label>
                  <input 
                    name="lastName" 
                    value={form.lastName}
                    placeholder="e.g., SurName" 
                    onChange={handlevalueChange} 
                    disabled={isNameLocked}
                    className={`p-3 rounded-lg border border-gray-300 outline-none transition w-full ${isNameLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white'}`} 
                    required 
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                {!isNameLocked ? (
                  <button
                    type="button"
                    onClick={handleLockIdentity}
                    className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition transform hover:-translate-y-1 shadow-md w-full sm:w-auto text-sm sm:text-base"
                  >
                    Confirm & Lock Identity
                  </button>
                ) : (
                  <span className="text-green-600 font-bold flex items-center justify-center sm:justify-start gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200 w-full sm:w-auto text-sm sm:text-base">
                    ✅ Identity Locked
                  </span>
                )}
              </div>
            </div>

           
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Employment Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Occupation</label>
                  <input name="occupation" placeholder="e.g., Engineer or Farmer" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Organization Name</label>
                  <input name="organizationName" placeholder="Company Name" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full"/>
                </div>
                <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Monthly Income (₹)</label>
                  <input name="monthlyIncome" type="number" placeholder="Income" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full" required />
                </div>
              </div>
            </div>

            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Loan Request Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Loan Type</label>
                  <select name="LoanType" onChange={handlevalueChange} required defaultValue="" className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white transition w-full">
                    <option value="" disabled>Select Type</option>
                    <option value="Personal">Personal Loan</option>
                    <option value="Home">Home Loan</option>
                    <option value="Education">Education Loan</option>
                    <option value="Gold">Gold Loan</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Tenure (Months)</label>
                  <input name="tenure" type="number" placeholder="Months" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full" required />
                </div>
                <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Amount (₹)</label>
                  <input name="loanAmount" type="number" placeholder="Amount" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full" required />
                </div>
              </div>
            </div>

            {isNewUser && (
              <div className="bg-indigo-50/50 p-5 sm:p-8 rounded-2xl border border-indigo-100">
                <div className="text-lg sm:text-xl text-indigo-800 font-bold border-l-4 border-indigo-600 pl-3 mb-6">
                  Previous Bank History <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-500 sm:ml-2 mt-1 sm:mt-0">(Required for new users)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700 text-sm sm:text-base">Years at Previous Bank</label>
                    <input name="yearsAtPreviousBank" type="number" placeholder="Years" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition w-full" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700 text-sm sm:text-base">Total Transaction Amount (Past Year)</label>
                    <input name="totalTransactionAmount" type="number" placeholder="Total Transactions" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition w-full" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700 text-sm sm:text-base">Fixed Deposits Amount</label>
                    <input name="fixedDepositsAmount" type="number" placeholder="Total FDs" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition w-full" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700 text-sm sm:text-base">Pending Loans Amount</label>
                    <input name="pendingLoansAmount" type="number" placeholder="Total Pending Loans" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition w-full" required={isNewUser} />
                  </div>
                </div>
              </div>
            )}

            
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-indigo-200">
                ✨ AI Powered Verfication
              </div>
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6 mt-2">
                Your Documents (PDF/Image)
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {documentsToRender.map((doc) => (
                  <div key={doc.name} className="flex flex-col gap-2">
                    <label className="font-bold text-gray-600 text-sm sm:text-base">{doc.label}</label>
                    <input 
                      type="file" 
                      name={doc.name} 
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf" 
                      className="block w-full text-xs sm:text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" 
                      required={!form[doc.name]} 
                    />
                    {renderAIBadge(doc.name)}
                  </div>
                ))}
              </div>

              {isNewUser && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <div className="text-base sm:text-lg text-indigo-700 font-bold mb-6 ">Previous Bank History Proofs</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {[
                      { label: <> Vintage Proof <span className="font-normal text-xs">(years with previous bank)</span></>, name: "proofOfOldbank" },
                      { label: "Bank Statements", name: "bankStatements" },
                      { label: "Income Proof (ITR)", name: "incomeProof" },
                      { label: "FD Receipts", name: "fdReceipts" },
                      { label: "Pending Loan Reports", name: "pendingLoanDocs" }
                    ].map((doc) => (
                      <div key={doc.name} className="flex flex-col gap-2">
                        <label className="font-bold text-gray-600 text-sm sm:text-base">{doc.label}</label>
                        <input 
                          type="file" 
                          name={doc.name} 
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf" 
                          className="block w-full text-xs sm:text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer" 
                          required={isNewUser && !form[doc.name]} 
                        />
                        {renderAIBadge(doc.name)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

           
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Nominee Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Nominee Name</label>
                  <input name="nomineeName" placeholder="Full Name" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition w-full" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">ID Proof</label>
                  <input type="file" name="nomineeIDcard" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-xs sm:text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Address Proof</label>
                  <input type="file" name="nomineeAddressproof" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-xs sm:text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700 text-sm sm:text-base">Signature</label>
                  <input type="file" name="nomineesign" onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="block w-full text-xs sm:text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
              </div>
            </div>

           
            <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-4 pt-8 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => router.push("/dashboard/customer")} 
                className="w-full sm:w-48 h-12 cursor-pointer bg-gray-200 text-gray-700 rounded-xl hover:font-bold hover:bg-red-500 hover:text-white transition transform hover:-translate-y-1 shadow-sm text-sm sm:text-base"
              >
                Discard
              </button>
              
              <button 
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full sm:w-64 cursor-pointer h-12 text-white transition transform hover:-translate-y-1 hover:font-bold shadow-md text-sm sm:text-base ${
                  isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 rounded-2xl cursor-pointer hover:bg-blue-700'
                }`}
              >
                {click ? "Submitting..." : Object.values(aiStatuses).some(s => s.loading) ? "Waiting for AI..." : "Submit Application"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}