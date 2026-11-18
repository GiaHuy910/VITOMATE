export type deployAppForm = {
  repoId: string;
  owner: string;
  name: string;
  branch: string;
  envVars: Record<string, string> | {};
};
export type deployAppResponse = {};
