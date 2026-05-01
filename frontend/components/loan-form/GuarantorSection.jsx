import PropTypes from 'prop-types';

export default function GuarantorSection({ form, handlevalueChange, handleFileChange, isEducation, isPersonal, isHome }) {
  return (
    <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
      <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Co-Applicant & Financial Guarantor</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="nomineeName" className="font-bold text-gray-700">Guarantor Full Name </label>
          <input id="nomineeName" name="nomineeName" placeholder="Guarantor Full Name" value={form.nomineeName} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nomineeAge" className="font-bold text-gray-700">Guarantor Age </label>
          <input id="nomineeAge" name="nomineeAge" type="number" min="0" placeholder="Guarantor Age" value={form.nomineeAge} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
        </div>
        <div className="flex flex-col gap-2">
            <label htmlFor="docGuarantorPhoto" className="text-sm font-bold text-gray-700">Guarantor Photo</label>
            <input id="docGuarantorPhoto" type="file" name="docGuarantorPhoto" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 cursor-pointer rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
        </div>
        <div className="flex flex-col gap-2">
            <label htmlFor="docGuarantorSignature" className="text-sm font-bold text-gray-700">Guarantor Signature</label>
            <input id="docGuarantorSignature" type="file" name="docGuarantorSignature" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 cursor-pointer rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
        </div>

        {(isEducation || isPersonal || isHome) && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="guarantorOrganization" className="font-bold text-gray-700">Guarantor Employer</label>
              <input id="guarantorOrganization" name="guarantorOrganization" placeholder="Company Name" value={form.guarantorOrganization} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="guarantorIncome" className="font-bold text-gray-700">Guarantor Monthly Income (₹)</label>
              <input id="guarantorIncome" name="guarantorIncome" type="number" min="0" placeholder="Monthly Income" value={form.guarantorIncome} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
            </div>
          </>
        )}
      </div>

      {(isEducation || isPersonal || isHome) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="docGuarantorKyc" className="text-sm font-bold text-gray-700">Guarantor KYC (Aadhaar/PAN)</label>
            <input id="docGuarantorKyc" type="file" name="docGuarantorKyc" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="docGuarantorFinancials" className="text-sm font-bold text-gray-700">Guarantor Income Proof (Salary Slips/ITR)</label>
            <input id="docGuarantorFinancials" type="file" name="docGuarantorFinancials" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-white file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" required />
          </div>
        </div>
      )}
    </div>
  );
}

GuarantorSection.propTypes = {
  form: PropTypes.object.isRequired,
  handlevalueChange: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  isEducation: PropTypes.bool.isRequired,
  isPersonal: PropTypes.bool.isRequired,
  isHome: PropTypes.bool.isRequired
};