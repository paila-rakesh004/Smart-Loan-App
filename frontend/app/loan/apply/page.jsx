"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-toastify";

export default function ApplyLoan() {
  const router = useRouter();

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
    if (form.nomineeIDcard)
      dataToSend.append("nominee_id_card", form.nomineeIDcard);
    if (form.nomineeAddressproof)
      dataToSend.append("nominee_address_proof", form.nomineeAddressproof);
    if (form.nomineesign)
      dataToSend.append("nominee_sign", form.nomineesign);

    try {
      const response = await API.post("loans/apply/", dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Loan submitted successfully!");
      router.push("/dashboard/customer");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  return (
    <div className="flex w-full min-h-screen justify-center items-center font-serif bg-gradient-to-r from-slate-100 to-blue-200">
      <div className="w-[600px] bg-gradient-to-r from-indigo-300 to-blue-900 rounded-xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center items-center text-white mb-4">
          <h1 className="text-3xl font-semibold">Apply for a Loan</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="w-full bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Employment Details
            </div>

            <div className="flex flex-col gap-3">

              <label className="font-medium text-red-900">
                Employee Occupation
              </label>
              <input
                name="occupation"
                placeholder="Occupation (e.g., Engineer)"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />

              <label className="font-medium text-red-900">
                Employee Organization
              </label>
              <input
                name="organizationName"
                placeholder="Organization Name"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />

              <label className="font-medium text-red-900">
                Monthly Income
              </label>
              <input
                name="monthlyIncome"
                type="number"
                placeholder="Monthly Income"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Loan Request
            </div>

            <div className="flex flex-col gap-3">

              <label className="font-medium text-red-900">Loan Type</label>

              <select
                name="LoanType"
                onChange={handlevalueChange}
                required
                defaultValue=""
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
              >
                <option value="" disabled>
                  Select Loan Type
                </option>
                <option value="Personal">Personal Loan</option>
                <option value="Home">Home Loan</option>
                <option value="Education">Education Loan</option>
                <option value="Gold">Gold Loan</option>
              </select>

              <label className="font-medium text-red-900">
                Tenure (Months)
              </label>
              <input
                name="tenure"
                type="number"
                placeholder="Tenure"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />

              <label className="font-medium text-red-900">
                Loan Amount
              </label>
              <input
                name="loanAmount"
                type="number"
                placeholder="Loan Amount"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Your Documents (PDF/Image)
            </div>

            <div className="flex flex-col gap-3">

              <label className="font-medium text-red-900">
                ID Proof (PAN / Aadhaar)
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="idproof"
                onChange={handleFileChange}
                required
              />

              <label className="font-medium text-red-900">
                Address Proof
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="addressProof"
                onChange={handleFileChange}
                required
              />

              <label className="font-medium text-red-900">
                Salary Slips (Last 3 Months)
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="salarySlips"
                onChange={handleFileChange}
                required
              />

              <label className="font-medium text-red-900">
                Employee ID Card
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="EmpIDcard"
                onChange={handleFileChange}
                required
              />

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:-translate-y-1 transition">
            <div className="text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-2 mb-4">
              Nominee Details
            </div>

            <div className="flex flex-col gap-3">

              <label className="font-medium text-red-900">
                Nominee Name
              </label>
              <input
                name="nomineeName"
                placeholder="Nominee Name"
                onChange={handlevalueChange}
                className="p-3 rounded-lg border focus:border-blue-800 outline-none"
                required
              />

              <label className="font-medium text-red-900">
                Nominee ID Proof
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="nomineeIDcard"
                onChange={handleFileChange}
                required
              />

              <label className="font-medium text-red-900">
                Nominee Address Proof
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="nomineeAddressproof"
                onChange={handleFileChange}
                required
              />

              <label className="font-medium text-red-900">
                Nominee Signature
              </label>
              <input
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                type="file"
                name="nomineesign"
                onChange={handleFileChange}
                required
              />

            </div>
          </div>

          <div className="flex justify-center gap-16 mt-4">

            <button
              type="button"
              onClick={() => router.push("/dashboard/customer")}
              className="w-32 h-11 bg-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-52 h-12 text-white bg-blue-600 rounded-lg hover:bg-blue-900 hover:-translate-y-1 transition"
            >
              Submit Application
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}