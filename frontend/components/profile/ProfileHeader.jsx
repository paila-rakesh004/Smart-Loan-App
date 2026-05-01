import PropTypes from 'prop-types';

export default function ProfileHeader({ title, backRoute, router }) {
  return (
    <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 order-1 md:order-2 text-center md:text-right">
        {title}
      </h1>
      <button
        onClick={() => router.push(backRoute)}
        className="px-6 py-2 bg-white text-blue-900 font-bold rounded-lg shadow-md cursor-pointer hover:-translate-y-1 transition transform order-2 md:order-1 w-full md:w-auto text-center"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

ProfileHeader.propTypes = {
  title: PropTypes.string.isRequired,
  backRoute: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
};