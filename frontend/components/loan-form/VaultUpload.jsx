import { CheckCircleIcon } from '@heroicons/react/24/solid';
import AIBadge from './AIBadge';
import PropTypes from 'prop-types';


export default function VaultUpload({ 
  label, name, isPresentInVault, fileUrl, acceptType = ".jpg,.jpeg,.png,.pdf",
  replaceDocs, toggleReplaceDoc, handleFileChange, aiStatus 
}) {
  const isReplacing = replaceDocs[name];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="font-bold text-gray-700 text-sm sm:text-base">{label}</label>
        {isPresentInVault && (
          <button 
            type="button" 
            onClick={() => toggleReplaceDoc(name)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 px-2 py-1 rounded border border-blue-200 cursor-pointer"
          >
            {isReplacing ? "Cancel Replace" : "Replace Document"}
          </button>
        )}
      </div>

      {isPresentInVault && !isReplacing ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm font-semibold text-green-700">Previously uploaded file</span>
          </div>
          {fileUrl && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-800 bg-green-200 hover:bg-green-300 px-3 py-1.5 rounded-md transition shadow-sm cursor-pointer inline-block text-center">
              View File
            </a>
          )}
        </div>
      ) : (
        <>
          <input 
            type="file" name={name} onChange={handleFileChange} accept={acceptType} 
            className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition" 
            required={!isPresentInVault || isReplacing}
          />
          <AIBadge status={aiStatus} />
        </>
      )}
    </div>
  );
}

VaultUpload.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isPresentInVault: PropTypes.bool,
  fileUrl: PropTypes.string,
  acceptType: PropTypes.string,
  replaceDocs: PropTypes.object.isRequired,
  toggleReplaceDoc: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  aiStatus: PropTypes.object
};