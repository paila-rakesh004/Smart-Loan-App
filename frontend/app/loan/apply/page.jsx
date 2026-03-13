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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handlevalueChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };
  const handleProfile = () =>{
    router.push('/profile/customer')
  }
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
      await API.post(endpoint, dataToSend, {
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
        toast.error("Failed to fetch user status");
      } finally {
        setLoadingStatus(false);
      }
    };
    checkUserStatus();
  }, [router]);

  if (loadingStatus) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5]">
        <h2 className="text-2xl font-bold text-blue-900 animate-pulse">Loading Application Form...</h2>
      </div>
    );
  }

  return (
    <div className="font-serif bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
      
      
      <div className="fixed w-full h-24 bg-gradient-to-r from-[#eef2f7] to-[#d9e4f5] z-60 flex items-center justify-center">
        
      
        <div className="w-full bg-white shadow-xl rounded-xl p-6 flex justify-between items-center">
          <div className="flex-1">
             <h1 className="text-3xl font-semibold text-blue-900 text-center ml-40 pl-50">
               Loan Application
             </h1>
          </div>
          <div className="flex gap-4">
            <button
            type = "button"
            onClick={handleProfile} 
            className="bg-indigo-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition transform hover:-translate-y-1">
              Profile
            </button>
            <button 
                type="button" 
                onClick={() => router.push("/dashboard/customer")} 
                className="bg-indigo-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500 transition transform hover:-translate-y-1"
              >
                Back
              </button>
            <button 
              type="button"
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition transform hover:-translate-y-1 shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="h-16 mb-10"></div>

      <div className="w-full max-w-5xl mx-auto px-10 font-sans">
        
        
        <div className="bg-white shadow-lg rounded-[2rem] p-10">
          
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-bold text-gray-800">Submit Your Request</h2>
             <p className="text-gray-500 mt-2 italic">Please fill in all the details accurately for faster processing.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            
            <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
              <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">
                Employment Details
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Occupation</label>
                  <input name="occupation" placeholder="e.g., Engineer" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Organization Name</label>
                  <input name="organizationName" placeholder="Company Name" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                  <label className="font-bold text-gray-700">Monthly Income (₹)</label>
                  <input name="monthlyIncome" type="number" placeholder="Income" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
              </div>
            </div>

        
            <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
              <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">
                Loan Request Details
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Loan Type</label>
                  <select name="LoanType" onChange={handlevalueChange} required defaultValue="" className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white transition">
                    <option value="" disabled>Select Type</option>
                    <option value="Personal">Personal Loan</option>
                    <option value="Home">Home Loan</option>
                    <option value="Education">Education Loan</option>
                    <option value="Gold">Gold Loan</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Tenure (Months)</label>
                  <input name="tenure" type="number" placeholder="Months" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                  <label className="font-bold text-gray-700">Amount (₹)</label>
                  <input name="loanAmount" type="number" placeholder="Amount" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
              </div>
            </div>

           
            {isNewUser && (
              <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
                <div className="text-xl text-indigo-800 font-bold border-l-4 border-indigo-600 pl-3 mb-6">
                  Previous Bank History <span className="text-sm font-normal text-gray-500 ml-2">(Required for new users)</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Years at Previous Bank</label>
                    <input name="yearsAtPreviousBank" type="number" placeholder="Years" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Total Transaction Amount (Past Year)</label>
                    <input name="totalTransactionAmount" type="number" placeholder="Total Transactions" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Fixed Deposits Amount</label>
                    <input name="fixedDepositsAmount" type="number" placeholder="Total FDs" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required={isNewUser} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Pending Loans Amount</label>
                    <input name="pendingLoansAmount" type="number" placeholder="Total Pending Loans" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required={isNewUser} />
                  </div>
                </div>
              </div>
            )}

            
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">
                Your Documents (PDF/Image)
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: "ID Proof", name: "idproof" },
                  { label: "Address Proof", name: "addressProof" },
                  { label: "Salary Slips", name: "salarySlips" },
                  { label: "Employee ID Card", name: "EmpIDcard" }
                ].map((doc) => (
                  <div key={doc.name} className="flex flex-col gap-2">
                    <label className="font-bold text-gray-600">{doc.label}</label>
                    <input 
                      type="file" 
                      name={doc.name} 
                      onChange={handleFileChange} 
                      className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" 
                      required 
                    />
                  </div>
                ))}
              </div>

              {isNewUser && (
                <div className="mt-8 border-t pt-8">
                  <div className="text-lg text-indigo-700 font-bold mb-6 italic">Previous Bank History Proofs</div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      { label: "Vintage Proof", name: "proofOfOldbank" },
                      { label: "Bank Statements", name: "bankStatements" },
                      { label: "Income Proof (ITR)", name: "incomeProof" },
                      { label: "FD Receipts", name: "fdReceipts" },
                      { label: "Pending Loan Docs", name: "pendingLoanDocs" }
                    ].map((doc) => (
                      <div key={doc.name} className="flex flex-col gap-2">
                        <label className="font-bold text-gray-600">{doc.label}</label>
                        <input 
                          type="file" 
                          name={doc.name} 
                          onChange={handleFileChange} 
                          className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer" 
                          required={isNewUser} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
              <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">
                Nominee Details
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Nominee Name</label>
                  <input name="nomineeName" placeholder="Full Name" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">ID Proof</label>
                  <input type="file" name="nomineeIDcard" onChange={handleFileChange} className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Address Proof</label>
                  <input type="file" name="nomineeAddressproof" onChange={handleFileChange} className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Signature</label>
                  <input type="file" name="nomineesign" onChange={handleFileChange} className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" required />
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-8 mt-6 pt-8 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => router.push("/dashboard/customer")} 
                className="w-48 h-12 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-red-500 hover:text-white transition transform hover:-translate-y-1 shadow-sm"
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="w-64 h-12 text-white bg-blue-600 rounded-xl font-bold shadow-md hover:bg-blue-800 transition transform hover:-translate-y-1"
              >
                Submit Application
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}