import VaultUpload from './VaultUpload';
import AIBadge from './AIBadge';
import PropTypes from 'prop-types';


export default function GeneralDocumentsSection({ kycStatus, replaceDocs, toggleReplaceDoc, handleFileChange, aiStatuses, requiresITR, isEmployed }) {
  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-bl-xl border-b border-l border-indigo-200">✨ AI Powered Verification</div>
      <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6 mt-4 sm:mt-0">General Documents</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <VaultUpload label="Aadhaar Card" name="aadharCard" isPresentInVault={kycStatus.documents_present.aadhar_card} fileUrl={kycStatus.urls?.aadhar_card} replaceDocs={replaceDocs} toggleReplaceDoc={toggleReplaceDoc} handleFileChange={handleFileChange} aiStatus={aiStatuses["aadharCard"]} />
        <VaultUpload label="PAN Card" name="panCard" isPresentInVault={kycStatus.documents_present.pan_card} fileUrl={kycStatus.urls?.pan_card} replaceDocs={replaceDocs} toggleReplaceDoc={toggleReplaceDoc} handleFileChange={handleFileChange} aiStatus={aiStatuses["panCard"]} />
        <VaultUpload label="Passport Photo" name="passportPhoto" isPresentInVault={kycStatus.documents_present.passport_photo} fileUrl={kycStatus.urls?.passport_photo} replaceDocs={replaceDocs} toggleReplaceDoc={toggleReplaceDoc} handleFileChange={handleFileChange} aiStatus={aiStatuses["passportPhoto"]} />
        
        <div className="flex flex-col gap-2">
          <label htmlFor="bankStatements" className="font-bold text-gray-700">Bank Statements (Last 6 Months)</label>
          <input id="bankStatements" type="file" name="bankStatements" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
        </div>

        {requiresITR && (
          <div className="flex flex-col gap-2">
            <label htmlFor="itrDocument" className="font-bold text-gray-700">Income Tax Return (ITR)</label>
            <input id="itrDocument" type="file" name="itrDocument" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
            <AIBadge status={aiStatuses["itrDocument"]} />
          </div>
        )}

        {isEmployed && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="salarySlips" className="font-bold text-gray-700">Salary Slips (Last 3 Months)</label>
              <input id="salarySlips" type="file" name="salarySlips" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
              <AIBadge status={aiStatuses["salarySlips"]} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="empIdCard" className="font-bold text-gray-700">Employee ID Card </label>
              <input id="empIdCard" type="file" name="empIdCard" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 cursor-pointer" required />
              <AIBadge status={aiStatuses["empIdCard"]} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

GeneralDocumentsSection.propTypes = {
  kycStatus: PropTypes.object.isRequired,
  replaceDocs: PropTypes.object.isRequired,
  toggleReplaceDoc: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  aiStatuses: PropTypes.object.isRequired,
  requiresITR: PropTypes.bool.isRequired,
  isEmployed: PropTypes.bool.isRequired
};