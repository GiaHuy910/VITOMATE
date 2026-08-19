const baseApi = "http://localhost:3001/users";

export const getCurrentUser = async () => {
  const response = await fetch(`${baseApi}/me`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to get user");
  }

  return data;
};

export const updateUser = async (field: string, value: string) => {
  const response = await fetch(`${baseApi}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      [field]: value,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Update failed");
  }

  return data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${baseApi}/me/avatar`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Upload avatar failed");
  }

  return data;
};

export const deleteAvatar = async () => {
  const response = await fetch(`${baseApi}/me/avatar`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Delete avatar failed");
  }

  return data;
};
