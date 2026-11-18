export type GithubRepository = {
  id: number;
  name: string;
  owner: string;
  defaultBranch: string;
};
export type storeRepositoryForm = {
  githubRepoId: Number;
  name: string;
  owner: string;
  defaultBranch: string;
  envVars: Record<string, string> | {};
};
