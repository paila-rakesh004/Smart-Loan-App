import React from 'react';
import PropTypes from 'prop-types';

export const PAGE_WRAPPER = "min-h-[100vh] font-sans bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] p-4 sm:p-6 lg:p-10";
export const LOADER_BG = "flex items-center justify-center min-h-[100vh] bg-linear-to-r from-[#eef2f7] to-[#d9e4f5]";
export const AVATAR_STYLE = "w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-br from-blue-500 to-indigo-800 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg mb-4";

export const DisabledField = ({ id, label, value }) => (
  <div>
    <label htmlFor={id} className="block text-gray-500 text-sm font-semibold mb-1">{label}</label>
    <input
      type="text"
      id={id}
      value={value || "N/A"}
      disabled
      className="w-full bg-gray-200 text-gray-500 border border-gray-300 rounded-xl p-3 cursor-not-allowed font-medium"
    />
  </div>
);
DisabledField.propTypes = { id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, value: PropTypes.string };

export const EditField = ({ id, name, label, type, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">{label}</label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      required
    />
  </div>
);
EditField.propTypes = { id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, label: PropTypes.string.isRequired, type: PropTypes.string.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired };

export const PasswordField = ({ id, label, type, value, onChange, extraClass = "" }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-400 transition ${extraClass}`}
      required
    />
  </div>
);
PasswordField.propTypes = { id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, type: PropTypes.string.isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, extraClass: PropTypes.string };