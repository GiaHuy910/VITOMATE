import { config } from "../config/config";

import type { deployForm } from "../types/repository";

const baseApi = `${config.api.server_api_dev}`;

export const checkGithubRepo = async (repoUrl: string) => {
  const response = await fetch(`${baseApi}/repo/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ repoUrl }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid repository");
  }
  return data;
};

export const deployRepository = async (body: deployForm) => {
  const response = await fetch(`${baseApi}/repo/store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid repository");
  }

  //nhớ sửa sau
  //unknown purpose yet, temporarily set here
  const deployForm = {
    repoId: data.repository.repo_id,
    owner: data.repository.owner,
    name: data.repository.name,
    branch: data.repository.branch,
    envVars: data.repository.env_vars,
  };
  await fetch(`${baseApi}/app/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(deployForm),
  });
  return data;
};
