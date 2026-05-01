import PropTypes from 'prop-types';
import UniversalFormField from './UniversalFormField';

export default function SecuritySection({ showpassword, setShowpassword, passwords, setPasswords, onSubmit, isUpdating }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-3 mb-6">
        Security
      </h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <UniversalFormField 
          id="old_password" label="Current Password" type={showpassword ? "text" : "password"} 
          value={passwords.old_password} onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
          focusRingColor="red"
        />
        <div>
          <UniversalFormField 
            id="new_password" label="New Password" type={showpassword ? "text" : "password"} 
            value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            focusRingColor="red" extraClass="pr-14"
          />
          <div className="mt-3 flex items-center">
            <input
              type="checkbox" id="showPasswordToggle"
              onChange={() => setShowpassword(!showpassword)} checked={showpassword}
              className="w-4 h-4 accent-red-500 cursor-pointer"
            /> 
            <label htmlFor="showPasswordToggle" className="text-sm text-gray-600 ml-2 cursor-pointer select-none">
              {showpassword ? "Hide password" : "Show password"}
            </label>
          </div>
        </div>
        <button
          type="submit" disabled={isUpdating}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition transform shadow-md ${
            isUpdating ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-500 text-white cursor-pointer hover:bg-red-700 hover:-translate-y-1'
          }`}
        >
          {isUpdating ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

SecuritySection.propTypes = {
  showpassword: PropTypes.bool.isRequired,
  setShowpassword: PropTypes.func.isRequired,
  passwords: PropTypes.object.isRequired,
  setPasswords: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
};