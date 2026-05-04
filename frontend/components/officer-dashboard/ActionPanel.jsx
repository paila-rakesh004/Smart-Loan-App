import React from 'react';
import PropTypes from 'prop-types';

const ActionPanel = ({ riskScore, handleCalculateRisk, notes, setNotes, selectedLoan, handleEligible, handleNotEligible }) => {
  return (
    <>
      <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        Risk Assessment
      </h3>
      <button
        onClick={handleCalculateRisk}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer font-bold hover:bg-blue-800 transition transform hover:-translate-y-1 w-full sm:w-auto shadow-md"
      >
        Calculate Risk Score
      </button>
      {riskScore && (() => {
        const riskColorMap = {
          'high': 'bg-red-600',
          'medium': 'bg-yellow-500',
          'low': 'bg-green-500'
        };
        const bgClass = riskColorMap[riskScore] || 'bg-green-500';
        return <div className={`mt-6 p-5 rounded-xl text-white shadow-md max-w-full ${bgClass}`}>
          <p className="text-lg"><span className="font-bold">Prediction:</span> <span className='font-bold capitalize ml-2'>{riskScore} Risk</span></p>
        </div>;
      })()}

      <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        Officer Decision
      </h3>
      <textarea
        rows="4"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write any remarks or internal notes here..."
        className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
      />
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleEligible()}
          disabled={selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible'}
          className={` text-white px-8 py-3 rounded-xl font-bold  shadow-md w-full sm:w-auto text-center ${selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 cursor-pointer hover:bg-red-600 transition transform hover:-translate-y-1'}`}
        >
           Eligible for Loan
        </button>
        <button
          onClick={() => handleNotEligible()}
          disabled={selectedLoan.status === 'Not Eligible' || selectedLoan.status === 'Eligible'}
          className={` text-white px-8 py-3 rounded-xl font-bold  shadow-md w-full sm:w-auto text-center ${selectedLoan.status === 'Eligible' || selectedLoan.status === 'Not Eligible'  ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 cursor-pointer hover:bg-red-600 transition transform hover:-translate-y-1'}`}
        >
           Not Eligible for Loan
        </button>
      </div>
    </>
  );
};

ActionPanel.propTypes = {
  riskScore: PropTypes.string,
  handleCalculateRisk: PropTypes.func.isRequired,
  notes: PropTypes.string.isRequired,
  setNotes: PropTypes.func.isRequired,
  selectedLoan: PropTypes.object.isRequired,
  handleEligible: PropTypes.func.isRequired,
  handleNotEligible: PropTypes.func.isRequired,
};

export default ActionPanel;