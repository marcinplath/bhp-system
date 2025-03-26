import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

const TopBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isTestPage = location.pathname.startsWith("/test");

  if (isTestPage) return null;

  const isActive = (path) => location.pathname === path;

  const [showChangeModal, setShowChangeModal] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        BHP-System
      </Link>
      <div className="flex gap-4 items-center">
        {/* 1) Niezalogowany */}
        {!user && (
          <>
            <Link to="/" className={isActive("/") ? "underline font-bold" : ""}>
              Zweryfikuj dostęp
            </Link>
            <Link
              to="/login"
              className={`bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 ${
                isActive("/login") ? "font-bold border-b-2 border-white" : ""
              }`}
            >
              Zaloguj
            </Link>
          </>
        )}

        {/* 2) Administrator */}
        {user?.role === "admin" && (
          <>
            <Link
              to="/admin"
              className={`hover:underline ${
                isActive("/admin") ? "font-bold border-b-2 border-white" : ""
              }`}
            >
              Panel główny
            </Link>
            <Link
              to="/manage-users"
              className={`hover:underline ${
                isActive("/manage-users")
                  ? "font-bold border-b-2 border-white"
                  : ""
              }`}
            >
              Zarządzaj użytkownikami
            </Link>
            <Link
              to="/questions"
              className={`hover:underline ${
                isActive("/questions")
                  ? "font-bold border-b-2 border-white"
                  : ""
              }`}
            >
              Pytania
            </Link>
            <Link
              to="/invitations"
              className={`hover:underline ${
                isActive("/invitations")
                  ? "font-bold border-b-2 border-white"
                  : ""
              }`}
            >
              Zaproszenia
            </Link>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
              Wyloguj
            </button>
            <span
              onClick={() => setShowChangeModal(true)}
              className="ml-2 text-sm italic cursor-pointer hover:underline"
              title="Kliknij, aby zmienić hasło"
            >
              {user.email}
            </span>
          </>
        )}

        {/* 3) zwykly uzytkownik - user */}
        {user?.role === "user" && (
          <>
            <Link
              to="/invitations"
              className={`hover:underline ${
                isActive("/invitations")
                  ? "font-bold border-b-2 border-white"
                  : ""
              }`}
            >
              Zaproszenia
            </Link>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
              Wyloguj
            </button>
            <span
              onClick={() => setShowChangeModal(true)}
              className="ml-2 text-sm italic cursor-pointer hover:underline"
              title="Kliknij, aby zmienić hasło"
            >
              {user.email}
            </span>
          </>
        )}
      </div>
      {showChangeModal && (
        <ChangePasswordModal onClose={() => setShowChangeModal(false)} />
      )}
    </nav>
  );
};

export default TopBar;
