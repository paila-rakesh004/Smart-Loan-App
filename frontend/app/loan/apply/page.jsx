"use client";

import { UserCircleIcon, ArrowLeftStartOnRectangleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useApplyLoan } from "@/hooks/loan/useLoan";

import LegalIdentitySection from '@/components/loan-form/LegalIdentitySection';
import EmploymentSection from '@/components/loan-form/EmploymentSection';
import LoanRequestSection from '@/components/loan-form/LoanRequestSection';
import GeneralDocumentsSection from '@/components/loan-form/GeneralDocumentsSection';
import AcademicDocumentsSection from '@/components/loan-form/AcademicDocumentsSection';
import PropertyDocumentsSection from '@/components/loan-form/PropertyDocumentsSection';
import GuarantorSection from '@/components/loan-form/GuarantorSection';

export default function ApplyLoan() {
  const {
    loadingStatus, router, aiStatuses, isNameLocked, showInfo, setShowInfo,
    kycStatus, form, replaceDocs, toggleReplaceDoc, isStudent, isEmployed, requiresITR,
    isEducation, isPersonal, isHome, isUnderageAndNoIncome, isSubmitDisabled,
    getSubmitButtonText, handleLogout, handlevalueChange, handleLockIdentity,
    handleFileChange, handleSubmit
  } = useApplyLoan();

  if (loadingStatus) return <div className="flex w-full min-h-screen justify-center items-center"><div className="w-15 h-15 border-6 border-indigo-500 border-b-transparent rounded-full animate-ping"></div></div>;

  return (
    <div className="font-serif bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
      <div className="fixed top-0 left-0 w-full bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] z-60 py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex justify-between items-center">
          <button onClick={() => router.push("/dashboard/customer")}><ArrowLeftIcon className="w-7 h-7 sm:w-9 sm:h-9 text-gray-700 cursor-pointer hover:-translate-y-0.5 transition" /></button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-900">Loan Application</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button onClick={() => router.push("/profile/customer")}><UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-700 cursor-pointer hover:-translate-y-0.5 transition" /></button>
            <button onClick={handleLogout}><ArrowLeftStartOnRectangleIcon className="w-7 h-7 sm:w-9 sm:h-9 text-red-600 cursor-pointer hover:-translate-y-0.5 transition" /></button>
          </div>
        </div>
      </div>

      <div className="h-24 sm:h-32"></div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-white shadow-lg rounded-2xl sm:rounded-4xl p-5 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
            
            <LegalIdentitySection form={form} isNameLocked={isNameLocked} handlevalueChange={handlevalueChange} handleLockIdentity={handleLockIdentity} />
            
            <EmploymentSection form={form} isStudent={isStudent} showInfo={showInfo} setShowInfo={setShowInfo} handlevalueChange={handlevalueChange} />
            
            <LoanRequestSection handlevalueChange={handlevalueChange} isStudent={isStudent} />
            
            <GeneralDocumentsSection kycStatus={kycStatus} replaceDocs={replaceDocs} toggleReplaceDoc={toggleReplaceDoc} handleFileChange={handleFileChange} aiStatuses={aiStatuses} requiresITR={requiresITR} isEmployed={isEmployed} />

            {isEducation && <AcademicDocumentsSection handleFileChange={handleFileChange} aiStatuses={aiStatuses} />}
            
            {isHome && <PropertyDocumentsSection handleFileChange={handleFileChange} aiStatuses={aiStatuses} />}
            
            <GuarantorSection form={form} handlevalueChange={handlevalueChange} handleFileChange={handleFileChange} isEducation={isEducation} isPersonal={isPersonal} isHome={isHome} />

            {isUnderageAndNoIncome && (
              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-lg mt-2 sm:mt-6 shadow-sm">
                <p className="text-red-800 font-bold">⚠️ Loan Eligibility Warning</p>
                <p className="text-red-700 text-sm mt-1">Based on your Aadhaar Card, you are {form.age} years old with zero declared income. Our policy does not allow loan approvals for individuals under 20 without an active income source.</p>
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 sm:gap-8 mt-4 pt-8 border-t border-gray-200">
              <button type="button" onClick={() => router.push("/dashboard/customer")} className="w-full sm:w-48 h-12 cursor-pointer hover:font-bold hover:-translate-y-0.5 hover:shadow-md bg-gray-200 text-gray-700 rounded-xl hover:bg-red-500 hover:text-white transition">Discard</button>
              <button type="submit" disabled={isSubmitDisabled || isUnderageAndNoIncome} className={`w-full sm:w-64 h-12 cursor-pointer hover:-translate-y-0.5 hover:font-bold hover:shadow-md text-white transition rounded-xl sm:rounded-2xl shadow-md ${(isSubmitDisabled || isUnderageAndNoIncome) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-blue-700'}`}>
                {getSubmitButtonText()}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}