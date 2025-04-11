import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
        Oops! Page not found 🚧
      </p>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
        The page you're looking for doesn't exist. Pehli fursat me nikal 
      </p>
      <Link
        to="/"
        className="px-6 py-2 border-2 border-gray-800 hover:border-gray-700 text-white rounded-xl transition-all duration-300"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default ErrorPage;
