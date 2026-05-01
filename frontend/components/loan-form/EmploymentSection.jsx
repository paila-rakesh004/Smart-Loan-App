import PropTypes from 'prop-types';

export default function EmploymentSection({ form, isStudent, showInfo, setShowInfo, handlevalueChange }) {
  return (
    <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
      <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Employment Details</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        <div className="flex flex-col gap-2">
          <label htmlFor="occupationType" className="font-bold text-gray-700">Occupation Type</label>
          <select 
            id="occupationType" name="occupationType" value={form.occupationType} 
            onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full bg-white cursor-pointer" required
          >
            <option value="" disabled>Select Occupation Type</option>
            <option value="Employed">Employed (Salaried)</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Business">Business Owner</option>
            <option value="Student">Student</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="occupation" className="font-bold text-gray-700">Occupation {isStudent && "(Education)"}</label>
          <input id="occupation" name="occupation" placeholder={isStudent ? "E.g., B.Tech Student" : "Occupation"} onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full"/>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="organizationName" className="relative flex items-center gap-2 font-bold text-gray-700 group">
            Organization Name {isStudent && "(College/School)"}
            <button
              type="button" onClick={() => setShowInfo(!showInfo)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowInfo(!showInfo); } }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-400 text-white text-xs cursor-pointer hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              aria-label="Information about organization name"
            >
              i
            </button>
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-3 py-2 rounded transition duration-300 z-10 text-center whitespace-nowrap
              ${showInfo ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} `}>
              Enter the workplace if you don&apos;t have specific organization name.
            </div>
          </label>
          <input
            name="organizationName" placeholder={isStudent ? "College/University Name" : "Company / Business Name"}
            onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="monthlyIncome" className="font-bold text-gray-700">Monthly Income (₹) {isStudent && "(Enter 0 if none)"}</label>
          <input id="monthlyIncome" name="monthlyIncome" type="number" min="0" onChange={handlevalueChange} className="p-3 rounded-lg border border-gray-300 w-full" required />
        </div>

      </div>
    </div>
  );
}

EmploymentSection.propTypes = {
  form: PropTypes.object.isRequired,
  isStudent: PropTypes.bool.isRequired,
  showInfo: PropTypes.bool.isRequired,
  setShowInfo: PropTypes.func.isRequired,
  handlevalueChange: PropTypes.func.isRequired
};