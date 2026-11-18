import { type ThemeType } from "../contexts/theme/ThemeContext";
import { apiFetch } from "./api";

const baseApi = `/users`;

export const updateUser = async (field: string, value: string) => {
  return apiFetch(`${baseApi}/me`, {
    method: "PATCH",
    body: JSON.stringify({ [field]: value }),
  });
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiFetch(`${baseApi}/me/avatar`, {
    method: "PATCH",
    body: formData,
  });
};

export const deleteAvatar = async () => {
  return apiFetch(`${baseApi}/me/avatar`, {
    method: "DELETE",
  });
};

export const updateTheme = async (theme: ThemeType) => {
  return apiFetch(`${baseApi}/me/theme`, {
    method: "PATCH",
    body: JSON.stringify({ theme }),
  });
};
