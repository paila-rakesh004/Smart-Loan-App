import PropTypes from 'prop-types';

export default function AvatarCard({ avatarInitial, username, subtitle}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center">
      <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-700 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg mb-4`}>
        {avatarInitial}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{username}</h2>
      <p className="text-gray-500 mt-1 text-sm sm:text-base">{subtitle}</p>
    </div>
  );
}

AvatarCard.propTypes = {
  avatarInitial: PropTypes.string,
  username: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};