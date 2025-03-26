import { useState } from "react";
import { verifyAccessCode } from "../api";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);

  const handleVerify = async () => {
    const data = await verifyAccessCode(code);
    setMessage(data.error || data.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center bg-white p-6 rounded shadow">
        <h2 className="text-2xl mb-4">Weryfikacja kodu dostępu</h2>
        <input
          className="p-2 border rounded w-64 mb-2"
          type="text"
          placeholder="Wpisz kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleVerify}
        >
          Sprawdź kod
        </button>
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyCode;
