"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";
import { UserCircleIcon, ArrowRightOnRectangleIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';


export default function ApplyLoan() {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [click, setClick] = useState(false);
  const [aiStatuses, setAiStatuses] = useState({});
  const [isNameLocked, setIsNameLocked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);


  const [kycStatus, setKycStatus] = useState({
    documents_present: { pan_card: false, aadhar_card: false, passport_photo: false }
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age : null,
    occupationType: "",
    occupation: "",
    organizationName: "",
    monthlyIncome: "",
    LoanType: "",
    tenure: "",
    loanAmount: "",
   
    panCard: null,
    aadharCard: null,
    passportPhoto: null,
    
    salarySlips: null,
    itrDocument: null,
    bankStatements: null,
    empIdCard: null,
    
    
    nomineeName: "",
    nomineeAge : "",
    guarantorOrganization: "",
    guarantorIncome: "",
    docGuarantorKyc: null,
    docGuarantorFinancials: null,
    docGuarantorPhoto: null,
    docGuarantorSignature: null,

    doc10thCert: null,
    doc12thCert: null,
    docDegreeCert: null,
    docAdmissionLetter: null,
    docFeeStructure: null,

    docAgreementSale: null,
    docEncumbranceCert: null,
    docBuildingPlan: null,
    docNoc: null,
  });

  const [replaceDocs, setReplaceDocs] = useState({
    aadharCard : false,
    panCard : false,
    passportPhoto : false
  }) 

  const toggleReplaceDoc = (docName) => {
    setReplaceDocs(prev => ({ ...prev, [docName]: !prev[docName] }));
    
    if (replaceDocs[docName]) {
      setForm(prev => ({ ...prev, [docName]: null }));
      setAiStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[docName];
        return newStatuses;
      });
    }
  };
  
  
  const isStudent = form.occupationType === "Student";
  const isEmployed = form.occupationType === "Employed";
  const requiresITR = ["Self-Employed", "Business", "Other"].includes(form.occupationType);
  const isEducation = form.LoanType === "Education";
  const isPersonal = form.LoanType === "Personal";
  const isHome = form.LoanType === "Home";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem('is_officer');
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
      panCard: "PAN Card",
      aadharCard: "Aadhaar Card",
      salarySlips: "Salary Slip",
      empIdCard: "Employee ID",
      itrDocument: "ITR",
      bankStatements: "Bank Statement",
      doc10thCert: "10th Certificate",
      doc12thCert: "12th Certificate",
      docDegreeCert: "Degree Certificate",
      docAdmissionLetter: "Admission Letter",
      docFeeStructure: "Fee Structure",
      docGuarantorKyc: "PAN Card", 
      docGuarantorFinancials: "Salary Slip", 
      docAgreementSale: "Agreement to Sale",
      docNoc: "No Objection Certificate"
    };

    const expectedDocType = documentTypeMap[fieldName] || "Unknown";

    const formData = new FormData();
    formData.append("document", file);
    formData.append("expected_doc_type", expectedDocType); 
    formData.append("first_name", form.firstName);
    formData.append("last_name", form.lastName);
    formData.append("organization_name", form.organizationName);
    formData.append("monthly_income", form.monthlyIncome);

    try {
      const token = localStorage.getItem("access_token");
      const res = await API.post("loans/verify-document/", formData);

      const { decision, confidence_score, ai_reasoning, extracted_data } = res.data;
      const scorePct = (confidence_score * 100).toFixed(0);

      setAiStatuses((prev) => ({
        ...prev,
        [fieldName]: { loading: false, decision: decision, confidence: scorePct, reasoning: ai_reasoning },
      }));

      if (fieldName === "aadharCard" && extracted_data?.calculated_age) {
          setForm(prev => ({ ...prev, age: extracted_data.calculated_age }));
          toast.info(`Age Extracted: ${extracted_data.calculated_age} years old`);
      }

      if (decision === "REJECTED_PLEASE_REUPLOAD") {
        toast.error(`Document Rejected: ${ai_reasoning}`);
        setForm((prev) => ({ ...prev, [fieldName]: null }));
        if (inputElement) inputElement.value = "";
      }
    } catch (error) {
      setAiStatuses((prev) => ({
        ...prev,
        [fieldName]: { loading: false, decision: "MANUAL_REVIEW", reasoning: "AI scan failed. Will be manually reviewed." },
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    if (!file) return;

    const aiWorthyDocs = [
      "panCard", "aadharCard", "salarySlips", "empIdCard", "itrDocument",
      "doc10thCert", "doc12thCert", "docDegreeCert", "docAdmissionLetter", "docFeeStructure",
      "docAgreementSale", "docNoc"
    ];

    if (aiWorthyDocs.includes(fieldName) && (!form.firstName || !form.lastName)) {
      toast.error("Please enter and lock your Legal First and Last Name before uploading documents!");
      e.target.value = ""; 
      return;
    }

    setForm({ ...form, [fieldName]: file });

    if (aiWorthyDocs.includes(fieldName)) {
      verifyDocumentWithAI(fieldName, file, e.target);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const isAiLoading = Object.values(aiStatuses).some((status) => status.loading);
    if (isAiLoading) {
      toast.warning("Please wait for AI verification to complete.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("occupation", form.occupationType);
    dataToSend.append("occ", form.occupation);
    dataToSend.append("organization_name", form.organizationName);
    dataToSend.append("monthly_income", form.monthlyIncome);
    dataToSend.append("loan_amount", form.loanAmount);
    dataToSend.append("loan_type", form.LoanType);
    dataToSend.append("tenure", form.tenure);
    dataToSend.append("nominee_name", form.nomineeName);
    dataToSend.append("nominee_age", form.nomineeAge);
    dataToSend.append("doc_guarantor_photo", form.docGuarantorPhoto);
    dataToSend.append("doc_guarantor_signature", form.docGuarantorSignature);
    
   
    if (form.panCard) dataToSend.append("pan_card_file", form.panCard);
    if (form.aadharCard) dataToSend.append("aadhar_card_file", form.aadharCard);
    if (form.passportPhoto) dataToSend.append("passport_photo", form.passportPhoto);
    if (form.age) dataToSend.append("age", form.age);
    if (form.bankStatements) dataToSend.append("bank_statements", form.bankStatements);
    if (form.docGuarantorKyc) dataToSend.append("doc_guarantor_kyc", form.docGuarantorKyc);
    if (form.docGuarantorFinancials) dataToSend.append("doc_guarantor_financials", form.docGuarantorFinancials);

    
    if (requiresITR) {
      if (form.itrDocument) dataToSend.append("itr_document", form.itrDocument);
    } else if (isEmployed) {
      if (form.salarySlips) dataToSend.append("salary_slips", form.salarySlips);
      if (form.empIdCard) dataToSend.append("emp_id_card", form.empIdCard);
    }

    if (isEducation) {
        dataToSend.append("guarantor_organization", form.guarantorOrganization);
        dataToSend.append("guarantor_income", form.guarantorIncome);
        if (form.doc10thCert) dataToSend.append("doc_10th_cert", form.doc10thCert);
        if (form.doc12thCert) dataToSend.append("doc_12th_cert", form.doc12thCert);
        if (form.docDegreeCert) dataToSend.append("doc_degree_cert", form.docDegreeCert);
        if (form.docAdmissionLetter) dataToSend.append("doc_admission_letter", form.docAdmissionLetter);
        if (form.docFeeStructure) dataToSend.append("doc_fee_structure", form.docFeeStructure);
        
    }

    if (isHome) {
        if (form.docAgreementSale) dataToSend.append("doc_agreement_sale", form.docAgreementSale);
        if (form.docEncumbranceCert) dataToSend.append("doc_encumbrance_cert", form.docEncumbranceCert);
        if (form.docBuildingPlan) dataToSend.append("doc_building_plan", form.docBuildingPlan);
        if (form.docNoc) dataToSend.append("doc_noc", form.docNoc);
    }

    dataToSend.append("ai_statuses", JSON.stringify(aiStatuses));
    setClick(true);

    try {
      await API.post("loans/apply/", dataToSend);
      toast.success("Loan submitted successfully!");
      router.push("/dashboard/customer");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setClick(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return router.push("/login");

    const fetchInitialData = async () => {
      try {
        const userRes = await API.get("users/check-status/");

        if (userRes.data.first_name || userRes.data.last_name) {
          setForm((prev) => ({ ...prev, firstName: userRes.data.first_name || "", lastName: userRes.data.last_name || "" }));
          setIsNameLocked(true); 
        }

        const kycRes = await API.get("users/my-kyc/");
        setKycStatus(kycRes.data);

      } catch (error) {
        toast.error("Failed to load profile data.");
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchInitialData();
  }, [router]);

  const isSubmitDisabled = click || Object.values(aiStatuses).some(s => s.loading) || Object.values(aiStatuses).some(s => s.decision === 'REJECTED_PLEASE_REUPLOAD');

  if (loadingStatus) return <div className="flex w-full min-h-screen justify-center items-center"><div className="w-15 h-15 border-6 border-indigo-500 border-b-transparent rounded-full animate-ping"></div></div>;

  const renderAIBadge = (fieldName) => {
    const status = aiStatuses[fieldName];
    if (!status) return null;
    if (status.loading) return <p className="text-sm font-semibold text-blue-600 animate-pulse mt-1">⏳ AI is scanning...</p>;
    if (status.decision === "AUTO_APPROVE") return <p className="text-sm font-bold text-green-600 mt-1">✅ AI Approved (Confidence: {status.confidence}%)</p>;
    if (status.decision === "MANUAL_REVIEW") return <p className="text-sm font-semibold text-yellow-700 mt-1">⚠️ Flagged for manual review</p>;
    if (status.decision === "REJECTED_PLEASE_REUPLOAD") return <p className="text-sm font-bold text-red-600 mt-1">❌ Rejected: {status.reasoning}</p>;
    return null;
  };

  const renderVaultUpload = (label, name, isPresentInVault, fileUrl, acceptType = ".jpg,.jpeg,.png,.pdf") => {
    const isReplacing = replaceDocs[name];

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-bold text-gray-700 text-sm sm:text-base">{label}</label>
        
          {isPresentInVault && (
            <button 
              type="button" 
              onClick={() => toggleReplaceDoc(name)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 px-2 py-1 rounded border border-blue-200 cursor-pointer"
            >
              {isReplacing ? "Cancel Replace" : "Replace Document"}
            </button>
          )}
        </div>

        {isPresentInVault && !isReplacing ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              <span className="text-sm font-semibold text-green-700">Retrieved from Bank Vault</span>
            </div>
            {fileUrl && (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-green-800 bg-green-200 hover:bg-green-300 px-3 py-1.5 rounded-md transition shadow-sm cursor-pointer inline-block text-center"
              >
                View File
              </a>
            )}
          </div>
        ) : (
          <>
            <input 
              type="file" 
              name={name} 
              onChange={handleFileChange} 
              accept={acceptType} 
              className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition" 
              required={!isPresentInVault || isReplacing}
            />
            {renderAIBadge(name)}
          </>
        )}
      </div>
    );
  };
  
  const isUnderageAndNoIncome = form.age && form.age < 20 && (form.monthlyIncome === "" || Number(form.monthlyIncome) === 0);
  
  return (
    <div className="font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
      
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-[60] py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex justify-between items-center">
          <button onClick={() => router.push("/dashboard/customer")}><ArrowLeftIcon className="w-7 h-7 sm:w-9 sm:h-9 text-gray-700 cursor-pointer hover:-translate-y-0.5 transition" /></button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-900">Loan Application</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button onClick={() => router.push("/profile/customer")}><UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-700 cursor-pointer hover:-translate-y-0.5 transition" /></button>
            <button onClick={handleLogout}><ArrowRightOnRectangleIcon className="w-7 h-7 sm:w-9 sm:h-9 text-red-600 cursor-pointer hover:-translate-y-0.5 transition" /></button>
          </div>
        </div>
      </div>

      <div className="h-24 sm:h-32"></div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-white shadow-lg rounded-2xl sm:rounded-4xl p-5 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Legal Identity</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <input name="firstName" value={form.firstName} placeholder="First Name" onChange={handlevalueChange} disabled={isNameLocked} className={`p-3 rounded-lg border border-gray-300 w-full ${isNameLocked ? "bg-gray-200 cursor-not-allowed" : "cursor-text"}`} required />
                <input name="lastName" value={form.lastName} placeholder="Last Name" onChange={handlevalueChange} disabled={isNameLocked} className={`p-3 rounded-lg border border-gray-300 w-full ${isNameLocked ? "bg-gray-200 cursor-not-allowed" : "cursor-text"}`} required />
              </div>
              <div className="mt-6 flex justify-end">
                {!isNameLocked ? (
                  <button type="button" onClick={handleLockIdentity} className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 hover:-translate-y-1 transform transition w-full sm:w-auto">Confirm & Lock Identity</button>
                ) : (
                  <span className="text-green-600 font-bold bg-green-100 cursor-default px-4 py-3 rounded-lg border border-green-200 w-full sm:w-auto text-center block sm:inline-block">✅ Identity Locked</span>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Employment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Occupation Type</label>
                  <select 
                    name="occupationType" 
                    value={form.occupationType} 
                    onChange={handlevalueChange} 
                    className="p-3 rounded-lg border border-gray-300 w-full bg-white cursor-pointer" 
                    required
                  >
                    <option value="" disabled>Select Occupation Type</option>
                    <option value="Employed">Employed (Salaried)</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business Owner</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Occupation {isStudent && "(Education)"}</label>
                  <input name="occupation" placeholder={isStudent ? "E.g., B.Tech Student" : "Occupation"} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full"/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 font-bold text-gray-700">Organization Name {isStudent && "(College/School)"}
                    <div className="relative group">
                      <span onClick={() => setShowInfo(!showInfo)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-400 text-white text-xs cursor-pointer">
                        i   </span>
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                        bg-black text-white text-xs px-3 py-2 rounded 
                        transition duration-300 z-10 w-50 text-center group-hover:opacity-100 pointer-events-none
                        ${showInfo ? "opacity-100" : "opacity-0 pointer-events-none"}
                       `}>
                        Farmer : Agriculture <br />
                        Driver : Transport Service <br />
                        Carpenter : Wood Work <br />
                        Electrician : Electric Service <br />
                        Plumber : Plumbing Service <br />
                      </div>  
                    </div> 
                  </label>

                  <input
                  name="organizationName"
                  placeholder={isStudent ? "College/University Name" : "Company / Business Name"}
                  onChange={handlevalueChange}
                  className="p-3 rounded-lg border border-gray-300 w-full"
                  />

                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Monthly Income (₹) {isStudent && "(Enter 0 if none)"}</label>
                  <input name="monthlyIncome" type="number" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Loan Request</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Select Loan Type</label>
                  <select name="LoanType" onChange={handlevalueChange} required defaultValue="" className="p-3 rounded-lg border border-gray-300 w-full">
                    <option value="" disabled>Select Type</option>
                    <option value="Personal">Personal Loan</option>
                    {!isStudent && <option value="Home">Home Loan</option>}
                    <option value="Education">Education Loan</option>
                    {/* <option value="Gold">Gold Loan</option> */}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Tenure </label>
                  <input name="tenure" type="number" placeholder="Tenure (Months)" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full h-[50px]" required />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-bold text-gray-700">Amount </label>
                  <input name="loanAmount" type="number" placeholder="Amount (₹)" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-bl-xl border-b border-l border-indigo-200">✨ AI Powered Verification</div>
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6 mt-4 sm:mt-0">General Documents</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {renderVaultUpload("Aadhaar Card", "aadharCard", kycStatus.documents_present.aadhar_card, kycStatus.urls?.aadhar_card)}
                {renderVaultUpload("PAN Card", "panCard", kycStatus.documents_present.pan_card, kycStatus.urls?.pan_card)}
                {renderVaultUpload("Passport Photo", "passportPhoto", kycStatus.documents_present.passport_photo, kycStatus.urls?.passport_photo)}
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Bank Statements (Last 6 Months)</label>
                  <input type="file" name="bankStatements" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
                </div>

                {requiresITR && (
                   <div className="flex flex-col gap-2">
                     <label className="font-bold text-gray-700">Income Tax Return (ITR)</label>
                     <input type="file" name="itrDocument" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
                     {renderAIBadge("itrDocument")}
                   </div>
                )}

                {isEmployed && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-gray-700">Salary Slips (Last 3 Months)</label>
                      <input type="file" name="salarySlips" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
                      {renderAIBadge("salarySlips")}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-gray-700">Employee ID Card </label>
                      <input type="file" name="empIdCard" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
                      {renderAIBadge("empIdCard")}
                    </div>
                  </>
                )}
              </div>
            </div>

            {isEducation && (
              <div className="bg-indigo-50/50 p-5 sm:p-8 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-bl-xl border-b border-l border-indigo-200">✨ AI Powered Verification</div>
                <div className="text-lg sm:text-xl text-indigo-800 font-bold border-l-4 border-indigo-600 pl-3 mb-6 mt-4 sm:mt-0">Academic Documents</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">10th Certificate</label>
                    <input type="file" name="doc10thCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
                    {renderAIBadge("doc10thCert")}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">12th Certificate</label>
                    <input type="file" name="doc12thCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
                    {renderAIBadge("doc12thCert")}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Degree Certificate (Optional)</label>
                    <input type="file" name="docDegreeCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" />
                    {renderAIBadge("docDegreeCert")}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Admission Letter</label>
                    <input type="file" name="docAdmissionLetter" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
                    {renderAIBadge("docAdmissionLetter")}
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Fee Structure Document</label>
                    <input type="file" name="docFeeStructure" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
                    {renderAIBadge("docFeeStructure")}
                  </div>
                </div>
              </div>
            )}

            {isHome && (
              <div className="bg-emerald-50/50 p-5 sm:p-8 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="text-lg sm:text-xl text-emerald-800 font-bold border-l-4 border-emerald-600 pl-3 mb-6">Property Documents</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Agreement to Sale / Allotment Letter</label>
                    <input type="file" name="docAgreementSale" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
                    {renderAIBadge("docAgreementSale")}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">No Objection Certificate (NOC)</label>
                    <input type="file" name="docNoc" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
                    {renderAIBadge("docNoc")}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Encumbrance Certificate (Manual Review)</label>
                    <input type="file" name="docEncumbranceCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Building Plan (Optional for Land/Plots)</label>
                    <input type="file" name="docBuildingPlan" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
              <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Co-Applicant & Financial Guarantor</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Guarantor Full Name </label>
                  <input name="nomineeName" placeholder="Guarantor Full Name" value={form.nomineeName} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Guarantor Age </label>
                  <input name="nomineeAge" type="number" placeholder="Guarantor Age" value={form.nomineeAge} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Guarantor Photo</label>
                    <input type="file" name="docGuarantorPhoto" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Guarantor Signature</label>
                    <input type="file" name="docGuarantorSignature" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
                </div>
                

                {(isEducation || isPersonal || isHome) && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-gray-700">Guarantor Employer</label>
                      <input name="guarantorOrganization" placeholder="Company Name" value={form.guarantorOrganization} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-gray-700">Guarantor Monthly Income (₹)</label>
                      <input name="guarantorIncome" type="number" placeholder="Monthly Income" value={form.guarantorIncome} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
                    </div>
                  </>
                )}
              </div>

              {(isEducation || isPersonal || isHome) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Guarantor KYC (Aadhaar/PAN)</label>
                    <input type="file" name="docGuarantorKyc" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Guarantor Income Proof (Salary Slips/ITR)</label>
                    <input type="file" name="docGuarantorFinancials" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
                   
                  </div>
                </div>
              )}
            </div>

            {isUnderageAndNoIncome && (
              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-lg mt-2 sm:mt-6 shadow-sm">
                <p className="text-red-800 font-bold">⚠️ Loan Eligibility Warning</p>
                <p className="text-red-700 text-sm mt-1">
                   Based on your Aadhaar Card, you are {form.age} years old with zero declared income. 
                   Our policy does not allow loan approvals for individuals under 20 without an active income source.
                </p>
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 sm:gap-8 mt-4 pt-8 border-t border-gray-200">
              <button type="button" onClick={() => router.push("/dashboard/customer")} className="w-full sm:w-48 h-12 cursor-pointer hover:font-bold hover:-translate-y-0.5 hover:shadow-md bg-gray-200 text-gray-700 rounded-xl hover:bg-red-500 hover:text-white transition">Discard</button>
              <button type="submit" disabled={isSubmitDisabled || isUnderageAndNoIncome} className={`w-full sm:w-64 h-12 cursor-pointer hover:-translate-y-0.5 hover:font-bold hover:shadow-md text-white transition rounded-xl sm:rounded-2xl shadow-md ${(isSubmitDisabled || isUnderageAndNoIncome) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-blue-700'}`}>
                {click ? "Submitting..." : Object.values(aiStatuses).some(s => s.loading) ? "Waiting for AI..." : "Submit Application"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}