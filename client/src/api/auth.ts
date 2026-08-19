const baseApi = "http://localhost:3001/auth";

export const logOutUser = async () => {
  const response = await fetch(`${baseApi}/logout`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
};
