import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api'; 
import { toast } from "react-toastify";

export const useOfficerDashboard = () => {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [sure, setSure] = useState(false);
  const [status, setStatus] = useState('Eligible');
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_officer');
    router.push('/login');
  };
  const handleProfile = () => {
    router.push('/profile/officer');
  };
  const handleRowClick = async (loan) => {
    setSelectedLoan(loan);
    setRiskScore(null);
    setNotes('');
    try {
      const res = await API.get(`loans/officer/${loan.id}/recalculate-cibil/`);
      const freshScore = res.data.new_cibil_score;
      setSelectedLoan(prev => ({ ...prev, actual_cibil: freshScore }));
      setLoans(loans.map(l => l.id === loan.id ? { ...l, actual_cibil: freshScore } : l));
      toast.success("Cibil Score Calculated");
    } catch (error) {
      const message = error?.response?.data?.message ||error?.message ||"Failed to calculate CIBIL score.";
      toast.error(message);
    }
  };
  const handleCalculateRisk = async () => {
    try {
      const res = await API.get(`loans/officer/${selectedLoan.id}/calculate-risk/`);
      const score = res.data.risk_score;
      setRiskScore(score);
      toast.success("Risk Score calculated successfully!");
      setLoans(loans.map(loan => loan.id === selectedLoan.id ? { ...loan, risk_score: res.data.risk_score } : loan));
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to calculate risk score.";
      toast.error(message);
    }
  };
  const confirmUpdate = async (newStatus) => {
    try {
      await API.patch(`loans/officer/${selectedLoan.id}/update-status/`, {
        status: newStatus,
        cibil_score: selectedLoan.actual_cibil === "N/A" ? null : selectedLoan.actual_cibil,
        officer_notes: notes,
        risk_score: riskScore
      });
      toast.success(`Applicant is ${newStatus} for loan approval!`);
      setLoans(loans.map(loan => loan.id === selectedLoan.id ? { ...loan, status: newStatus } : loan));
      setSelectedLoan(null);
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to update application status.";
      toast.error(message);
    } finally {
      setSure(false);
    }
  };
  const handleEligible = () => {
    setSure(true);
    setStatus('Eligible');
  };
  const handleNotEligible = () => {
    setSure(true);
    setStatus('Not Eligible'); 
  };
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const isOfficer = localStorage.getItem('is_officer');
    if (isOfficer !== 'true') {
      toast.error("Security Alert: Unauthorized Access");
      router.push('/dashboard/customer');
      return;
    }
    const fetchAllLoans = async () => {
      try {
        const res = await API.get('loans/officer/all-loans/');
        setLoans(res.data);
      } catch (error) {
        if (error.response?.status === 403) {
            router.push('/dashboard/customer');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllLoans();
  }, [router]);

  return {
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
  };
};