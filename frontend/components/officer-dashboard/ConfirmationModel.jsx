import React from 'react';
import PropTypes from 'prop-types';

const ConfirmationModel = ({ confirmUpdate, setSure, status }) => {
  return (
    <div className='flex flex-col items-center justify-center gap-5 w-70 h-40 z-10 bg-white shadow-md rounded-4xl p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 '>
        <div className='text-3xl'>Are you Sure ? </div>
            <div className='flex gap-8'>
                <button className='rounded text-xl w-10 h-8 text-white bg-blue-500 cursor-pointer hover:bg-indigo-800'
                 onClick={() => confirmUpdate(status)}>Yes</button>
                <button className='rounded text-xl w-10 h-8 text-white bg-red-500 cursor-pointer hover:bg-red-800'
                 onClick={() => setSure(false)}>No</button>
            </div>
      </div>
  );
};

ConfirmationModel.propTypes = {
  confirmUpdate: PropTypes.func.isRequired,
  setSure: PropTypes.func.isRequired,
  status: PropTypes.string,
};

export default ConfirmationModel;