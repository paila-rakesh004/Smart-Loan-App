import React from 'react';
import PropTypes from 'prop-types';

const ApplicantInfo = ({ selectedLoan }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl shadow-sm border border-blue-100 text-gray-800">
      <div className="space-y-3">
        <p><span className="font-bold text-gray-700">Applicant Name :</span> {selectedLoan.applicant_name || `User ID: ${selectedLoan.user}`}</p>
        <p><span className="font-bold text-gray-700">Age:</span> {selectedLoan.applicant_age}</p>
        <p><span className="font-bold text-gray-700">Loan Type :</span> {selectedLoan.loan_type}</p>
        <p><span className="font-bold text-gray-700">Loan Amount :</span> ₹{selectedLoan.loan_amount}</p>
        <p><span className="font-bold text-gray-700">Monthly Income : </span>₹{selectedLoan.monthly_income}</p>
        <p><span className="font-bold text-gray-700">Occupation Type :</span> {selectedLoan.occupation}</p>
        <p><span className="font-bold text-gray-700">Occupation :</span> {selectedLoan.occ}</p>
      </div>

      <div className="space-y-3">
        <p><span className="font-bold text-gray-700">Applicant ID :</span> {selectedLoan.id}</p>
        <p><span className="font-bold text-gray-700">Tenure :</span> {selectedLoan.tenure} months</p>
        <p><span className="font-bold text-gray-700">Status :</span> 
          {(() => {
            const statusColorMap = {
              'Eligible': 'bg-green-100 text-green-700',
              'Not Eligible': 'bg-red-100 text-red-700'
            };
            const colorClass = statusColorMap[selectedLoan.status] || 'bg-yellow-100 text-yellow-700';
            return <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>{selectedLoan.status}</span>;
          })()}
        </p>
        
        <div className="space-y-3 mt-4">
           <p><span className="font-bold text-gray-700">Live CIBIL Score :</span> <span className={selectedLoan.actual_cibil < 600 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{selectedLoan.actual_cibil || "N/A"}</span></p>
           <p><span className="font-bold text-gray-700">Total Transactions :</span> ₹{selectedLoan.total_transaction_amount || 0}</p>
           <p><span className="font-bold text-gray-700">Fixed Deposits :</span> ₹{selectedLoan.fixed_deposits || 0}</p>
           <p><span className="font-bold text-gray-700">Working At :</span> {selectedLoan.organization_name}</p>
        </div>
      </div>
    </div>
  );
};

ApplicantInfo.propTypes = {
  selectedLoan: PropTypes.object.isRequired,
};

export default ApplicantInfo;