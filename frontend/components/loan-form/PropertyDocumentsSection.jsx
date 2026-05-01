import AIBadge from './AIBadge';
import PropTypes from 'prop-types';

export default function PropertyDocumentsSection({ handleFileChange, aiStatuses }) {
  return (
    <div className="bg-emerald-50/50 p-5 sm:p-8 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
      <div className="text-lg sm:text-xl text-emerald-800 font-bold border-l-4 border-emerald-600 pl-3 mb-6">Property Documents</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="docAgreementSale" className="text-sm font-bold text-gray-700">Agreement to Sale / Allotment Letter</label>
          <input id="docAgreementSale" type="file" name="docAgreementSale" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
          <AIBadge status={aiStatuses["docAgreementSale"]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="docNoc" className="text-sm font-bold text-gray-700">No Objection Certificate (NOC)</label>
          <input id="docNoc" type="file" name="docNoc" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
          <AIBadge status={aiStatuses["docNoc"]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="docEncumbranceCert" className="text-sm font-bold text-gray-700">Encumbrance Certificate (Manual Review)</label>
          <input id="docEncumbranceCert" type="file" name="docEncumbranceCert" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="docBuildingPlan" className="text-sm font-bold text-gray-700">Building Plan (Optional for Land/Plots)</label>
          <input id="docBuildingPlan" type="file" name="docBuildingPlan" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-emerald-50 file:text-emerald-700" />
        </div>
      </div>
    </div>
  );
}

PropertyDocumentsSection.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  aiStatuses: PropTypes.object.isRequired
};