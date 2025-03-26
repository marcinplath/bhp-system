import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, createUser } from "../api/manageUsers";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Błąd pobierania użytkowników");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Wpisz email i hasło!");
      return;
    }
    try {
      const data = await createUser(email, password, role);

      setSuccess(`Użytkownik ${data.user.email} został utworzony pomyślnie!`);
      setEmail("");
      setPassword("");
      setRole("user");
      fetchAllUsers();
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || "Wystąpił błąd podczas tworzenia użytkownika.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Na pewno usunąć użytkownika?")) return;
    try {
      await deleteUser(id);
      setSuccess("Użytkownik usunięty.");
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Błąd usuwania użytkownika.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj użytkownikami</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {/* Formularz tworzenia użytkownika */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Stwórz nowego użytkownika
        </h3>
        <form onSubmit={handleCreateUser}>
          <div className="mb-3">
            <label className="block font-semibold mb-1">Email:</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. user@example.com"
            />
          </div>
          <div className="mb-3">
            <label className="block font-semibold mb-1">Hasło:</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          <div className="mb-3">
            <label className="block font-semibold mb-1">Rola:</label>
            <select
              className="border p-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Użytkownik</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Utwórz
          </button>
        </form>
      </div>

      {/* Tabela użytkowników */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Lista użytkowników</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Rola</th>
              <th className="border p-2">Data utworzenia</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2 text-center">{u.id}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2 text-center">{u.role}</td>
                <td className="border p-2 text-center">
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Brak użytkowników do wyświetlenia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;
