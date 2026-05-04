import React from 'react';
import PropTypes from 'prop-types';
import DocumentCard from './DocumentCard';
import ApplicantInfo from './ApplicantInfo';
import ActionPanel from './ActionPanel';

const ApplicationDetails = ({
  sure,
  selectedLoan,
  setSelectedLoan,
  renderOfficerAIBadge,
  riskScore,
  handleCalculateRisk,
  notes,
  setNotes,
  handleEligible,
  handleNotEligible
}) => {
  return (
    <div className={`${sure ? 'blur-sm pointer-events-none z-0 fixed' : 'bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full relative '}`}>
      
      <button onClick={() => setSelectedLoan(null)} className="mb-4 px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-4xl sm:text-5xl cursor-pointer text-gray-600 hover:text-blue-600 transition hover:-translate-y-1">
        ←
      </button>
      
      <h2 className="mt-2 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        Application Details
      </h2>

      <ApplicantInfo selectedLoan={selectedLoan} />

      <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        General KYC Documents
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DocumentCard title="PAN Card" url={selectedLoan.pan_card_file} badgeKey="panCard" colorClass="bg-red-50 border-red-200" renderBadge={renderOfficerAIBadge} />
        <DocumentCard title="Aadhaar Card" url={selectedLoan.aadhar_card_file} badgeKey="aadharCard" colorClass="bg-red-50 border-red-200" renderBadge={renderOfficerAIBadge} />
        <DocumentCard title="Passport Photo" url={selectedLoan.passport_photo} colorClass="bg-red-50 border-red-200" renderBadge={renderOfficerAIBadge} />
      </div>

      {(selectedLoan.itr_document || selectedLoan.bank_statements || selectedLoan.salary_slips || selectedLoan.emp_id_card) && (
        <>
          <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-indigo-600 pl-3 font-bold">
            Employment & Financial Proofs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <DocumentCard title="Bank Statements" url={selectedLoan.bank_statements} badgeKey="bankStatements" colorClass="bg-green-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Income Proof (ITR)" url={selectedLoan.itr_document} badgeKey="itrDocument" colorClass="bg-green-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Salary Slips" url={selectedLoan.salary_slips} badgeKey="salarySlips" colorClass="bg-green-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Employee ID" url={selectedLoan.emp_id_card} badgeKey="empIdCard" colorClass="bg-green-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
          </div>
        </>
      )}

      {selectedLoan.loan_type === 'Education' && (
        <>
          <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-indigo-600 pl-3 font-bold">
            Academic Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <DocumentCard title="10th Certificate" url={selectedLoan.doc_10th_cert} badgeKey="doc10thCert" colorClass="bg-indigo-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="12th Certificate" url={selectedLoan.doc_12th_cert} badgeKey="doc12thCert" colorClass="bg-indigo-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Degree Certificate" url={selectedLoan.doc_degree_cert} badgeKey="docDegreeCert" colorClass="bg-indigo-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Admission Letter" url={selectedLoan.doc_admission_letter} badgeKey="docAdmissionLetter" colorClass="bg-indigo-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Fee Structure" url={selectedLoan.doc_fee_structure} badgeKey="docFeeStructure" colorClass="bg-indigo-50 border-indigo-200" renderBadge={renderOfficerAIBadge} />
          </div>
        </>
      )}

      {selectedLoan.loan_type === 'Home' && (
        <>
          <h3 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-emerald-600 pl-3 font-bold">
            Property Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <DocumentCard title="Agreement to Sale" url={selectedLoan.doc_agreement_sale} badgeKey="docAgreementSale" colorClass="bg-emerald-50 border-emerald-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="No Objection Certificate" url={selectedLoan.doc_noc} badgeKey="docNoc" colorClass="bg-emerald-50 border-emerald-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Encumbrance Certificate" url={selectedLoan.doc_encumbrance_cert} colorClass="bg-emerald-50 border-emerald-200" renderBadge={renderOfficerAIBadge} />
            <DocumentCard title="Building Plan" url={selectedLoan.doc_building_plan} colorClass="bg-emerald-50 border-emerald-200" renderBadge={renderOfficerAIBadge} />
          </div>
        </>
      )}

      <div className="mt-8 mb-8 bg-gray-50 border border-gray-200 p-4 rounded-xl text-center shadow-sm">
        <p className="text-xs sm:text-sm text-gray-500">
          <span className="font-bold text-gray-700">Note:</span> The &quot;AI Pre-Screened&quot; tags are generated by automated LLM analysis. Please reverify flagged documents for quality assurance purposes.
        </p>
      </div>

      <h4 className="mt-10 mb-6 text-gray-800 text-xl sm:text-2xl border-l-4 border-blue-600 pl-3 font-bold">
        Co-Applicant / Guarantor Details
      </h4>
      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-6">
        <p><span className="font-bold text-gray-700">Name:</span> {selectedLoan.nominee_name || 'N/A'}</p>
        <p><span className="font-bold text-gray-700">Age:</span> {selectedLoan.nominee_age || 'N/A'}</p>
        {selectedLoan.guarantor_income && <p><span className="font-bold text-gray-700">Guarantor Income:</span> ₹{selectedLoan.guarantor_income}</p>}
        {selectedLoan.guarantor_organization && <p><span className="font-bold text-gray-700">Guarantor Employer:</span> {selectedLoan.guarantor_organization}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> 
        <DocumentCard title="Guarantor KYC" url={selectedLoan.doc_guarantor_kyc}  colorClass="bg-blue-50 border-blue-200" renderBadge={renderOfficerAIBadge} />
        <DocumentCard title="Guarantor Financials" url={selectedLoan.doc_guarantor_financials} colorClass="bg-blue-50 border-blue-200" renderBadge={renderOfficerAIBadge} />
        <DocumentCard title="Guarantor Photo" url={selectedLoan.doc_guarantor_photo} colorClass="bg-blue-50 border-blue-200" renderBadge={renderOfficerAIBadge} />
        <DocumentCard title="Guarantor Signature" url={selectedLoan.doc_guarantor_signature} colorClass="bg-blue-50 border-blue-200" renderBadge={renderOfficerAIBadge} />
      </div>
      
      <ActionPanel 
        riskScore={riskScore}
        handleCalculateRisk={handleCalculateRisk}
        notes={notes}
        setNotes={setNotes}
        selectedLoan={selectedLoan}
        handleEligible={handleEligible}
        handleNotEligible={handleNotEligible}
      />
    </div>
  );
};

ApplicationDetails.propTypes = {
  sure: PropTypes.bool.isRequired,
  selectedLoan: PropTypes.object.isRequired,
  setSelectedLoan: PropTypes.func.isRequired,
  renderOfficerAIBadge: PropTypes.func.isRequired,
  riskScore: PropTypes.string,
  handleCalculateRisk: PropTypes.func.isRequired,
  notes: PropTypes.string.isRequired,
  setNotes: PropTypes.func.isRequired,
  handleEligible: PropTypes.func.isRequired,
  handleNotEligible: PropTypes.func.isRequired,
};

export default ApplicationDetails;