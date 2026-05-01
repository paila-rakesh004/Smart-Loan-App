import AIBadge from './AIBadge';
import PropTypes from 'prop-types';

export default function AcademicDocumentsSection({ handleFileChange, aiStatuses }) {
  return (
    <div className="bg-indigo-50/50 p-5 sm:p-8 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-bl-xl border-b border-l border-indigo-200">✨ AI Powered Verification</div>
      <div className="text-lg sm:text-xl text-indigo-800 font-bold border-l-4 border-indigo-600 pl-3 mb-6 mt-4 sm:mt-0">Academic Documents</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="doc10thCert" className="text-sm font-bold text-gray-700">10th Certificate</label>
          <input id="doc10thCert" type="file" name="doc10thCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
          <AIBadge status={aiStatuses["doc10thCert"]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="doc12thCert" className="text-sm font-bold text-gray-700">12th Certificate</label>
          <input id="doc12thCert" type="file" name="doc12thCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
          <AIBadge status={aiStatuses["doc12thCert"]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="docDegreeCert" className="text-sm font-bold text-gray-700">Degree Certificate (Optional)</label>
          <input id="docDegreeCert" type="file" name="docDegreeCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" />
          <AIBadge status={aiStatuses["docDegreeCert"]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="docAdmissionLetter" className="text-sm font-bold text-gray-700">Admission Letter</label>
          <input id="docAdmissionLetter" type="file" name="docAdmissionLetter" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
          <AIBadge status={aiStatuses["docAdmissionLetter"]} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="docFeeStructure" className="text-sm font-bold text-gray-700">Fee Structure Document</label>
          <input id="docFeeStructure" type="file" name="docFeeStructure" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700" required />
          <AIBadge status={aiStatuses["docFeeStructure"]} />
        </div>
      </div>
    </div>
  );
}


AcademicDocumentsSection.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  aiStatuses: PropTypes.object.isRequired
};