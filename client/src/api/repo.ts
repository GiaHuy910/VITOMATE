const baseApi = "http://localhost:3001";

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

type deployForm = {
  repositoryId: Number;
  name: string;
  owner: string;
  defaultBranch: string;
  language: string;
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

  //unknown purpose yet, temporarily set here
  const deployForm = {
    repo_id: data.repository.repo_id,
    owner: data.repository.owner,
    name: data.repository.name,
    branch: data.repository.defaultBranch,
  };
  await fetch(`http://localhost:4000/api/projects/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(deployForm),
  });

  return data;
};
