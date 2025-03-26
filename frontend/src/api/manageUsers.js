import api from "./api";

export const createUser = async (email, password, role = "user") => {
  try {
    const response = await api.post("/admin/create-user", {
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Błąd tworzenia użytkownika:", error.response?.data || error);
    throw error;
  }
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data.users;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};
