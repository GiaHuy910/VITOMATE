import type { deployAppForm } from "../types/app";
import { apiFetch } from "./api";

const baseApi = "/app";
export const deployApp = (body: deployAppForm) => {
  const { repoId, owner, name, branch, envVars } = body;
  return apiFetch(`${baseApi}/deploy`, {
    method: "POST",
    body: JSON.stringify({ repoId, owner, name, branch, envVars }),
  });
};
