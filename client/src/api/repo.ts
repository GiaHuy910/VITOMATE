import { deploy } from "./deployment";
import { config } from "../config/url";
const baseApi = `${config.server_1_url_dev}/repo`;

export const checkGithubRepo = async (repoUrl: string) => {
  const response = await fetch(`${baseApi}/check`, {
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

export type deployForm = {
  repositoryId: Number;
  name: string;
  owner: string;
  defaultBranch: string;
  language: string;
};

export const deployRepository = async (body: deployForm) => {
  const response = await fetch(`${baseApi}/store`, {
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

  const deployForm = {
    repo_id: data.repository.repo_id,
    owner: data.repository.owner,
    name: data.repository.name,
    branch: data.repository.branch,
  };
  deploy(deployForm);

  return data;
};
