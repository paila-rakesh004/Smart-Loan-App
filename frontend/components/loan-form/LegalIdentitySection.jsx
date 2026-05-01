import PropTypes from 'prop-types';

export default function LegalIdentitySection({ form, isNameLocked, handlevalueChange, handleLockIdentity }) {
  return (
    <div className="bg-blue-50/50 p-5 sm:p-8 rounded-2xl border border-blue-100">
      <div className="text-lg sm:text-xl text-blue-800 font-bold border-l-4 border-blue-600 pl-3 mb-6">Legal Identity</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <input name="firstName" value={form.firstName} placeholder="First Name" onChange={handlevalueChange} disabled={isNameLocked} className={`p-3 rounded-lg border border-gray-300 w-full ${isNameLocked ? "bg-gray-200 cursor-not-allowed" : "cursor-text"}`} required />
        <input name="lastName" value={form.lastName} placeholder="Last Name" onChange={handlevalueChange} disabled={isNameLocked} className={`p-3 rounded-lg border border-gray-300 w-full ${isNameLocked ? "bg-gray-200 cursor-not-allowed" : "cursor-text"}`} required />
      </div>
      <div className="mt-6 flex justify-end">
        {isNameLocked ? (
          <span className="text-green-600 font-bold bg-green-100 cursor-default px-4 py-3 rounded-lg border border-green-200 w-full sm:w-auto text-center block sm:inline-block">✅ Identity Locked</span>
        ) : (
          <button type="button" onClick={handleLockIdentity} className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 hover:-translate-y-1 transform transition w-full sm:w-auto">Confirm & Lock Identity</button>
        )}
      </div>
    </div>
  );
}

LegalIdentitySection.propTypes = {
  form: PropTypes.object.isRequired,
  isNameLocked: PropTypes.bool.isRequired,
  handlevalueChange: PropTypes.func.isRequired,
  handleLockIdentity: PropTypes.func.isRequired
};