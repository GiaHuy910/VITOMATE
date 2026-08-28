/**
 * Platform dùng Raw Access Token để đăng ký Webhook trực tiếp với GitHub
 */
async function registerGithubWebhook({ owner, repo /*rawAccessToken*/ }) {
  //const webhookUrl = repo;
  //const secret = process.env.GITHUB_WEBHOOK_SECRET;

  const response = await fetch(repo, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${rawAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: repo,
        content_type: "json",
        secret: secret,
        insecure_ssl: "0",
      },
    }),
  });

  if (response.status === 422) {
    console.log(`[Platform] Webhook đã tồn tại trên ${repo}`);
    return true;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Đăng ký Webhook thất bại: ${errorData.message}`);
  }

  return true;
}

module.exports = { registerGithubWebhook };
