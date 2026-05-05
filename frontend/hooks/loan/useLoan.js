import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";

export const useApplyLoan = () => {
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
    age: null, 
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
    nomineeAge: "", 
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
    aadharCard: false, panCard: false, passportPhoto: false
  });
  const isStudent = form.occupationType === "Student";
  const isEmployed = form.occupationType === "Employed";
  const requiresITR = ["Self-Employed", "Business", "Other"].includes(form.occupationType);
  const isEducation = form.LoanType === "Education";
  const isPersonal = form.LoanType === "Personal";
  const isHome = form.LoanType === "Home";
  const isUnderageAndNoIncome = form.age && form.age < 20 && (form.monthlyIncome === "" || Number(form.monthlyIncome) === 0);
  const isSubmitDisabled = click || Object.values(aiStatuses).some(s => s.loading) || Object.values(aiStatuses).some(s => s.decision === 'REJECTED_PLEASE_REUPLOAD');
  const getSubmitButtonText = () => {
    if (click) return "Submitting...";
    if (Object.values(aiStatuses).some(s => s.loading)) return "Waiting for AI...";
    return "Submit Application";
  };
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
  const handleLogout = async () => {
    try{
      await API.post("users/logout/");
    }
    catch(error){
      toast.error(error?.response?.data?.error || "Failed to Logout.");
    }
    finally{
      router.push("/login");
    }
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
      panCard: "PAN Card", aadharCard: "Aadhaar Card", salarySlips: "Salary Slip",
      empIdCard: "Employee ID", itrDocument: "ITR", bankStatements: "Bank Statement",
      doc10thCert: "10th Certificate", doc12thCert: "12th Certificate", docDegreeCert: "Degree Certificate",
      docAdmissionLetter: "Admission Letter", docFeeStructure: "Fee Structure", docGuarantorKyc: "PAN Card", 
      docGuarantorFinancials: "Salary Slip", docAgreementSale: "Agreement to Sale", docNoc: "No Objection Certificate"
    };
    
    const expectedDocType = documentTypeMap[fieldName] || "Unknown";
    const formData = new FormData();
    formData.append("document", file);
    formData.append("expected_doc_type", expectedDocType); 
    formData.append("first_name", form.firstName);
    formData.append("last_name", form.lastName);
    
    formData.append("declared_org", form.organizationName);
    formData.append("declared_income", form.monthlyIncome);
    formData.append("declared_years", form.tenure); 

    try {
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
      const errorMessage = error.response?.data?.reason || error.response?.data?.error || "AI scan failed. Will be manually reviewed.";
      
      if (error.response?.status === 422) {
          toast.warning(errorMessage);
      } else {
          toast.error(errorMessage);
      }

      setAiStatuses((prev) => ({
        ...prev,
        [fieldName]: { loading: false, decision: "MANUAL_REVIEW", reasoning: errorMessage },
      }));
      
      setForm((prev) => ({ ...prev, [fieldName]: null }));
      if (inputElement) inputElement.value = "";
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    if (!file) return;

    const aiWorthyDocs = new Set([
      "panCard", "aadharCard", "salarySlips", "empIdCard", "itrDocument",
      "doc10thCert", "doc12thCert", "docDegreeCert", "docAdmissionLetter", "docFeeStructure",
      "docAgreementSale", "docNoc"
    ]);

    if (aiWorthyDocs.has(fieldName) && (!form.firstName || !form.lastName)) {
      toast.error("Please enter and lock your Legal First and Last Name before uploading documents!");
      e.target.value = ""; 
      return;
    }

    const validationRules = {
      salarySlips: {
        isValid: Boolean(form.monthlyIncome && form.organizationName),
        message: "Frontend Check: Please type your Monthly Income and Organization Name first!"
      },
      itrDocument: {
        isValid: Boolean(form.monthlyIncome),
        message: "Frontend Check: Please type your Monthly Income first!"
      },
      empIdCard: {
        isValid: Boolean(form.organizationName),
        message: "Frontend Check: Please type your Organization Name first!"
      },
      bankStatements: {
        isValid: Boolean(form.tenure),
        message: "Frontend Check: Please enter your Tenure first!"
      }
    };

    const rule = validationRules[fieldName];
    if (rule && !rule.isValid) {
      toast.warning(rule.message);
      e.target.value = ""; 
      return;
    }

    setForm({ ...form, [fieldName]: file });
    
    if (aiWorthyDocs.has(fieldName)) {
      verifyDocumentWithAI(fieldName, file, e.target);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    const appendIfExists = (fieldsObj) => {
      Object.entries(fieldsObj).forEach(([key, value]) => {
        if (value) dataToSend.append(key, value);
      });
    };
    appendIfExists({
      pan_card_file: form.panCard,
      aadhar_card_file: form.aadharCard,
      passport_photo: form.passportPhoto,
      age: form.age,
      bank_statements: form.bankStatements,
      doc_guarantor_kyc: form.docGuarantorKyc,
      doc_guarantor_financials: form.docGuarantorFinancials,
    });
    if (requiresITR) {
      appendIfExists({ itr_document: form.itrDocument });
    } else if (isEmployed) {
      appendIfExists({ salary_slips: form.salarySlips, emp_id_card: form.empIdCard });
    }
    if (isEducation) {
      dataToSend.append("guarantor_organization", form.guarantorOrganization);
      dataToSend.append("guarantor_income", form.guarantorIncome);
      appendIfExists({
        doc_10th_cert: form.doc10thCert,
        doc_12th_cert: form.doc12thCert,
        doc_degree_cert: form.docDegreeCert,
        doc_admission_letter: form.docAdmissionLetter,
        doc_fee_structure: form.docFeeStructure,
      });
    }
    if (isHome) {
      appendIfExists({
        doc_agreement_sale: form.docAgreementSale,
        doc_encumbrance_cert: form.docEncumbranceCert,
        doc_building_plan: form.docBuildingPlan,
        doc_noc: form.docNoc,
      });
    }
    dataToSend.append("ai_statuses", JSON.stringify(aiStatuses));
    setClick(true);
    try {
      await API.post("loans/apply/", dataToSend);
      toast.success("Loan submitted successfully!");
      router.push("/dashboard/customer");
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setClick(false);
    }
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, kycRes] = await Promise.all([
          API.get("users/check-status/"), API.get("users/my-kyc/")
        ]);
        if (userRes.data.first_name || userRes.data.last_name) {
          setForm((prev) => ({ ...prev, firstName: userRes.data.first_name || "", lastName: userRes.data.last_name || "" }));
          setIsNameLocked(true); 
        }
        setKycStatus(kycRes.data);
      } catch {
        toast.error("Failed to load profile data.");
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchInitialData();
  }, [router]);

  return {
    loadingStatus, router, click, aiStatuses, isNameLocked, showInfo, setShowInfo,
    kycStatus, form, replaceDocs, toggleReplaceDoc, isStudent, isEmployed, requiresITR,
    isEducation, isPersonal, isHome, isUnderageAndNoIncome, isSubmitDisabled,
    getSubmitButtonText, handleLogout, handlevalueChange, handleLockIdentity,
    handleFileChange, handleSubmit
  };
};