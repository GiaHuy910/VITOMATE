import type { storeRepositoryForm } from "../types/repository";
import { apiFetch } from "./api";

const baseApi = "/repo";
export const checkGithubRepo = async (repoUrl: string) => {
  return apiFetch(`${baseApi}/check`, {
    method: "POST",
    body: JSON.stringify({ repoUrl }),
  });
};
export const storeRepository = (body: storeRepositoryForm) => {
  return apiFetch(`${baseApi}/store`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};
