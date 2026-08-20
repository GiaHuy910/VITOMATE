const GITHUB_API = "https://api.github.com";

const githubHeaders = (accessToken) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${accessToken}`,
});

const getGithubAccessToken = async (code) => {
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    },
  );

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || tokenData.error) {
    throw new Error("Failed to get GitHub access token");
  }

  return tokenData.access_token;
};

const getGithubUser = async (accessToken) => {
  const githubUserResponse = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(accessToken),
  });
  if (!githubUserResponse.ok) {
    throw new Error("Failed to get Github user");
  }

  return await githubUserResponse.json();
};

const getGithubEmail = async (accessToken) => {
  const githubEmailResponse = await fetch(`${GITHUB_API}/user/emails`, {
    headers: githubHeaders(accessToken),
  });
  if (!githubEmailResponse.ok) {
    throw new Error("Failed to get GitHub emails");
  }

  const githubEmails = await githubEmailResponse.json();

  const primaryEmail = githubEmails.find(
    (email) => email.primary && email.verified,
  );
  return primaryEmail?.email || null;
};

const getGithubUserInfo = async (code) => {
  const accessToken = await getGithubAccessToken(code);

  const [githubUser, email] = await Promise.all([
    getGithubUser(accessToken),
    getGithubEmail(accessToken),
  ]);

  return {
    githubId: String(githubUser.id),
    username: githubUser.login,
    email,
    accessToken,
  };
};

module.exports = {
  getGithubAccessToken,
  getGithubUser,
  getGithubEmail,
  getGithubUserInfo,
};
