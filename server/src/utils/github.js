const parseGithubRepoUrl = (repoUrl) => {
  let url;
  try {
    url = new URL(repoUrl.trim());
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("GitHub URL must use HTTPS");
  }
  if (url.hostname !== "github.com") {
    throw new Error("URL is not a GitHub URL");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Invalid GitHub repository URL");
  }
  return {
    owner: parts[0],
    repo: parts[1].replace(/\.git$/, ""),
  };
};

module.exports = {
  parseGithubRepoUrl,
};
