//thieu env
const deployToPlatform = async (
  app_id,
  deployment_order,
  owner,
  name,
  branch,
  env_vars,
) => {
  const body = { app_id, deployment_order, owner, name, branch, env_vars };
  const response = await fetch("http://vitomate.com:4001/api/builders/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SERVER_TOKEN}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};
module.exports = { deployToPlatform };
