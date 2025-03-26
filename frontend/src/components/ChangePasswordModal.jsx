import { useState } from "react";
import api from "../api/api";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Błąd zmiany hasła.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Zmień hasło</h2>
        <input
          className="border p-2 w-full mb-2 text-black"
          type="password"
          placeholder="Obecne hasło"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-4 text-black"
          type="password"
          placeholder="Nowe hasło"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Zapisz
          </button>
        </div>
        {message && <p className="mt-2 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
