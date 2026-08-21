const baseApi = "http://localhost:3001/auth";

export const getCurrentUser = async () => {
  const response = await fetch(`${baseApi}/me`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unauthorized");
  }
  return data;
};
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
export const signInUser = async (email: string, password: string) => {
  const response = await fetch(`${baseApi}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Sign in failed");
  }
  return data;
};
export const signUpUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${baseApi}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Sign Up failed");
  }
  return data;
};
export const getGithubUrl = () => {
  return `${baseApi}/github`;
};
