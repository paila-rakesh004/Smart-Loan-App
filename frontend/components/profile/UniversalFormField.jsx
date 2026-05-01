import PropTypes from 'prop-types';

export default function UniversalFormField({ id, name, label, type = "text", value, onChange, disabled = false, focusRingColor = "indigo", extraClass = "" }) {
  const labelColor = disabled ? "text-gray-500 text-sm font-semibold mb-1" : "block text-gray-700 font-semibold mb-2";
  const inputBaseClass = "w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 transition";
  const inputDisabledClass = disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed font-medium" : "";
  const inputFocusClass = `focus:ring-${focusRingColor}-400`;
  const inputClass = `${inputBaseClass} ${inputDisabledClass} ${inputFocusClass} ${extraClass}`.trim();

  return (
    <div>
      <label htmlFor={id} className={labelColor}>{label}</label>
      <input
        type={type}
        id={id}
        name={name || id}
        value={value || (disabled ? "N/A" : "")}
        onChange={onChange}
        disabled={disabled}
        required={!disabled}
        className={inputClass}
      />
    </div>
  );
}

UniversalFormField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  focusRingColor: PropTypes.string,
  extraClass: PropTypes.string,
};