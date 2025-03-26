import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Brak uprawnień</h1>
      <p className="mb-4 text-lg">
        Nie masz wystarczających uprawnień, aby wyświetlić tę stronę.
      </p>
      <Link
        to="/"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
