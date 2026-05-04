"use client";
import React from 'react';
import { UserCircleIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/solid';
import { useOfficerDashboard } from '@/hooks/dashboards/officer/useOfficerDashboard';
import ActiveLoansTable from '@/components/officer-dashboard/LoanTable';
import ConfirmationModal from '@/components/officer-dashboard/ConfirmationModel';
import ApplicationDetails from '@/components/officer-dashboard/ApplicationDetails';

const OfficerDashboard = () => {
  const {
    loans,
    selectedLoan,
    setSelectedLoan,
    loading,
    riskScore,
    notes,
    setNotes,
    sure,
    setSure,
    status,
    handleLogout,
    handleProfile,
    handleRowClick,
    handleCalculateRisk,
    confirmUpdate,
    handleEligible,
    handleNotEligible
  } = useOfficerDashboard();

  const renderOfficerAIBadge = (documentKey) => {
    if (!selectedLoan?.ai_verification_data?.[documentKey]) return null; 
    
    const aiData = selectedLoan.ai_verification_data[documentKey];

    if (aiData.decision === "AUTO_APPROVE") {
      return (
        <div className="mt-2 bg-green-50 border border-green-200 p-2 rounded-lg">
          <p className="text-xs font-bold text-green-700">✨ AI Pre-Screened: Verified ({aiData.confidence}%)</p>
        </div>
      );
    }
    if (aiData.decision === "MANUAL_REVIEW") {
      return (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded-lg">
          <p className="text-xs font-bold text-yellow-700">⚠️ AI Flagged for Review ({aiData.confidence}%)</p>
          <p className="text-xs text-yellow-600 mt-1 italic">{aiData.reasoning}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-r from-[#eef2f7] to-[#d9e4f5]">
        <div className="w-15 h-15 border-6 border-t-blue-700 border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="relative z-0 font-serif bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] min-h-screen pb-10">
        
      <div className="fixed top-0 left-0 w-full bg-linear-to-r from-[#eef2f7] to-[#d9e4f5] z-50 py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto text-center sm:text-left">
             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-900">
               Officer Dashboard
             </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={handleProfile} className="cursor-pointer transition transform hover:-translate-y-1">
              <UserCircleIcon className="w-10 h-10 text-blue-700" />
            </button>
            <button onClick={handleLogout} className="cursor-pointer rounded-full font-bold transition transform hover:-translate-y-1">
              <ArrowLeftStartOnRectangleIcon className="w-9 h-9 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-40 sm:h-32"></div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        {selectedLoan ? (
          <ApplicationDetails 
            sure={sure}
            selectedLoan={selectedLoan}
            setSelectedLoan={setSelectedLoan}
            renderOfficerAIBadge={renderOfficerAIBadge}
            riskScore={riskScore}
            handleCalculateRisk={handleCalculateRisk}
            notes={notes}
            setNotes={setNotes}
            handleEligible={handleEligible}
            handleNotEligible={handleNotEligible}
          />
        ) : (
          <ActiveLoansTable loans={loans} handleRowClick={handleRowClick} />
        )}
      </div>

      {sure && (
        <ConfirmationModal confirmUpdate={confirmUpdate} setSure={setSure} status={status} />
      )}
    </div>
  );
};

export default OfficerDashboard;