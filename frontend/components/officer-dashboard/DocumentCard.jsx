import React from 'react';
import PropTypes from 'prop-types';

const DocumentCard = ({ title, url, badgeKey, colorClass = "bg-gray-50 border-gray-200", renderBadge }) => {
  if (!url) return null;
  return (
    <div className={`${colorClass} border p-5 rounded-xl shadow-sm hover:shadow-md transition`}>
      <p className="font-bold text-gray-700 mb-2">{title}</p>
      <a className="text-blue-600 font-normal hover:font-bold hover:text-blue-800 underline block mb-2" href={url} target="_blank" rel="noopener noreferrer">
        View Document
      </a>
      {badgeKey && renderBadge(badgeKey)}
    </div>
  );
};

DocumentCard.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  badgeKey: PropTypes.string,
  colorClass: PropTypes.string,
  renderBadge: PropTypes.func, 
};

export default DocumentCard;