import PropTypes from 'prop-types';

export default function AIBadge({ status }) {
  if (!status) return null;
  if (status.loading) return <p className="text-sm font-semibold text-blue-600 animate-pulse mt-1">⏳ AI is scanning...</p>;
  if (status.decision === "AUTO_APPROVE") return <p className="text-sm font-bold text-green-600 mt-1">✅ AI Approved (Confidence: {status.confidence}%)</p>;
  if (status.decision === "MANUAL_REVIEW") return <p className="text-sm font-semibold text-yellow-700 mt-1">⚠️ Flagged for manual review</p>;
  if (status.decision === "REJECTED_PLEASE_REUPLOAD") return <p className="text-sm font-bold text-red-600 mt-1">❌ Rejected: {status.reasoning}</p>;
  return null;
}

AIBadge.propTypes = {
  status: PropTypes.shape({
    loading: PropTypes.bool,
    decision: PropTypes.string,
    confidence: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reasoning: PropTypes.string,
  })
};