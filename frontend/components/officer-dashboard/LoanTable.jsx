import React from 'react';
import PropTypes from 'prop-types';

const LoanTable = ({ loans, handleRowClick }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full">
      <h2 className="mb-8 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        Active Loan Applications
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-150 border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700 border-b border-gray-200">
              <th className="p-4 font-bold">Applicant Name</th>
              <th className="p-4 font-bold">Amount</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr key={loan.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                  <td className="p-4 font-medium text-gray-800">{loan.applicant_name || `User ID: ${loan.user}`}</td>
                  <td className="p-4 text-gray-700">₹{loan.loan_amount}</td>
                  <td className="p-4">
                    <span className={(() => {
                      const statusColorMap = {
                        'Eligible': 'bg-green-100 text-green-700',
                        'Not Eligible': 'bg-red-100 text-red-700'
                      };
                      const colorClass = statusColorMap[loan.status] || 'bg-yellow-100 text-yellow-700';
                      return `px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${colorClass}`;
                    })()}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleRowClick(loan)}
                      className="bg-blue-600 cursor-pointer text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-sm hover:-translate-y-0.5"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500 font-medium italic">
                  No active applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

LoanTable.propTypes = {
  loans: PropTypes.array.isRequired,
  handleRowClick: PropTypes.func.isRequired,
};

export default LoanTable;