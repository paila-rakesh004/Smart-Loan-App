import PropTypes from 'prop-types';

export default function LoanRequestSection({ handlevalueChange, isStudent }) {
  return (
    <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
      <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Loan Request</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        <div className="flex flex-col gap-2">
          <label htmlFor="LoanType" className="font-bold text-gray-700">Select Loan Type</label>
          <select id="LoanType" name="LoanType" onChange={handlevalueChange} required defaultValue="" className="p-3 rounded-lg border cursor-pointer border-gray-300 w-full">
            <option value="" disabled>Select Type</option>
            <option value="Personal">Personal Loan</option>
            {!isStudent && <option value="Home">Home Loan</option>}
            <option value="Education">Education Loan</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="tenure" className="font-bold text-gray-700">Tenure </label>
          <input id="tenure" name="tenure" type="number" min="0" placeholder="Tenure (Months)" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full h-12.5" required />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="loanAmount" className="font-bold text-gray-700">Amount </label>
          <input id="loanAmount" name="loanAmount" type="number" min="0" placeholder="Amount (₹)" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
        </div>

      </div>
    </div>
  );
}

LoanRequestSection.propTypes = {
  handlevalueChange: PropTypes.func.isRequired,
  isStudent: PropTypes.bool.isRequired
};