import { config } from "../config/config";
import { apiFetch } from "./api";
const baseApi = "/auth";
const serverApi = config.api.server_api_dev;

export const getCurrentUser = async () => {
  return apiFetch(`${baseApi}/me`, {
    method: "GET",
  });
};
export const logOutUser = async () => {
  return apiFetch(`${baseApi}/logout`, {
    method: "POST",
  });
};
export const signInUser = async (email: string, password: string) => {
  return apiFetch(`${baseApi}/signin`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};
export const signUpUser = async (
  username: string,
  email: string,
  password: string,
) => {
  return apiFetch(`${baseApi}/signup`, {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
};
export const getGithubUrl = () => {
  return `${serverApi}${baseApi}/github`;
};
