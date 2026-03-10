"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";

export default function ApplyLoan() {
  const router = useRouter();

  const [isNewUser, setIsNewUser] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [form, setForm] = useState({
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

  const handlevalueChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in!");
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
    if (form.EmpIDcard) dataToSend.append("emp_id_card", form.EmpIDcard);
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

    try {
      
      const endpoint = isNewUser ? "loans/apply-new-user/" : "loans/apply/";
      
      const response = await API.post(endpoint, dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Loan submitted successfully!");
      router.push("/dashboard/customer");
    } catch (error) {
      toast.error("Something went wrong!");
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
      } catch (error) {
        toast.error("Failed to fetch user status", error);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkUserStatus();
  }, [router]);

  if (loadingStatus) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
        <h2 className="text-2xl font-bold text-blue-900">Loading Application Form...</h2>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen justify-center items-center font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] py-10">
      <div className="w-[600px] bg-gradient-to-r from-indigo-300 to-blue-900 rounded-xl shadow-xl p-8 border border-slate-200">
        
        <div className="flex justify-center items-center text-white mb-4">
          <h1 className="text-4xl font-bold">Apply for a Loan</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <div className="w-full bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Employment Details
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-red-900">Employee Occupation</label>
              <input name="occupation" placeholder="Occupation (e.g., Engineer)" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />

              <label className="font-medium text-red-900">Employee Organization</label>
              <input name="organizationName" placeholder="Organization Name" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />

              <label className="font-medium text-red-900">Monthly Income</label>
              <input name="monthlyIncome" type="number" placeholder="Monthly Income" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Loan Request
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-red-900">Loan Type</label>
              <select name="LoanType" onChange={handlevalueChange} required defaultValue="" className="p-3 rounded-lg border focus:border-blue-800 outline-none">
                <option value="" disabled>Select Loan Type</option>
                <option value="Personal">Personal Loan</option>
                <option value="Home">Home Loan</option>
                <option value="Education">Education Loan</option>
                <option value="Gold">Gold Loan</option>
              </select>

              <label className="font-medium text-red-900">Tenure (Months)</label>
              <input name="tenure" type="number" placeholder="Tenure" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />

              <label className="font-medium text-red-900">Loan Amount</label>
              <input name="loanAmount" type="number" placeholder="Loan Amount" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />
            </div>
          </div>

          
          {isNewUser && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
              <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
                Previous Bank History <span className="text-sm text-gray-500 font-normal block">(Required for new customers)</span>
              </div>
              <div className="flex flex-col gap-3">
                <label className="font-medium text-red-900">Years at Previous Bank</label>
                <input name="yearsAtPreviousBank" type="number" placeholder="Years" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required={isNewUser} />

                <label className="font-medium text-red-900">Total Transaction Amount (Past Year)</label>
                <input name="totalTransactionAmount" type="number" placeholder="Total Transactions" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required={isNewUser} />

                <label className="font-medium text-red-900">Fixed Deposits Amount</label>
                <input name="fixedDepositsAmount" type="number" placeholder="Total FDs" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required={isNewUser} />

                <label className="font-medium text-red-900">Pending Loans Amount</label>
                <input name="pendingLoansAmount" type="number" placeholder="Total Pending Loans" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required={isNewUser} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Your Documents (PDF/Image)
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-red-900">ID Proof (PAN / Aadhaar)</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:pointer-cursor" type="file" name="idproof" onChange={handleFileChange} required />

              <label className="font-medium text-red-900">Address Proof</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="addressProof" onChange={handleFileChange} required />

              <label className="font-medium text-red-900">Salary Slips (Last 3 Months)</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="salarySlips" onChange={handleFileChange} required />

              <label className="font-medium text-red-900">Employee ID Card</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="EmpIDcard" onChange={handleFileChange} required />

             
              {isNewUser && (
                <>
                  <h4 className="font-bold text-blue-800 mt-4 border-t pt-4">Previous Bank Proofs</h4>
                  
                  <label className="font-medium text-red-900">Proof of Account Vintage</label>
                  <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="proofOfOldbank" onChange={handleFileChange} required={isNewUser} />

                  <label className="font-medium text-red-900">Income Proof (ITR)</label>
                  <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="incomeProof" onChange={handleFileChange} required={isNewUser} />

                  <label className="font-medium text-red-900">Bank Statements</label>
                  <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="bankStatements" onChange={handleFileChange} required={isNewUser} />

                  <label className="font-medium text-red-900">FD Receipts</label>
                  <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="fdReceipts" onChange={handleFileChange} required={isNewUser} />

                  <label className="font-medium text-red-900">Pending Loan Documents</label>
                  <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="pendingLoanDocs" onChange={handleFileChange} required={isNewUser} />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Nominee Details
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-red-900">Nominee Name</label>
              <input name="nomineeName" placeholder="Nominee Name" onChange={handlevalueChange} className="p-3 rounded-lg border focus:border-blue-800 outline-none" required />

              <label className="font-medium text-red-900">Nominee ID Proof</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="nomineeIDcard" onChange={handleFileChange} required />

              <label className="font-medium text-red-900">Nominee Address Proof</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:cursor-pointer file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="nomineeAddressproof" onChange={handleFileChange} required />

              <label className="font-medium text-red-900">Nominee Signature</label>
              <input className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:cursor-pointer file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" type="file" name="nomineesign" onChange={handleFileChange} required />
            </div>
          </div>

          <div className="flex justify-center gap-16 mt-4">
            <button type="button" onClick={() => router.push("/dashboard/customer")} className="w-32 h-11 bg-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition">
              Cancel
            </button>
            <button type="submit" className="w-52 h-12 text-white bg-blue-600 rounded-lg hover:bg-blue-900 hover:-translate-y-1 transition">
              Submit Application
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}