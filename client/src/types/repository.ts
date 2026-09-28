export type GithubRepository = {
  id: number;
  name: string;
  owner: string;
  defaultBranch: string;
};
export type deployForm = {
  githubRepoId: Number;
  name: string;
  owner: string;
  defaultBranch: string;
  envVars: Record<string, string> | {};
};
