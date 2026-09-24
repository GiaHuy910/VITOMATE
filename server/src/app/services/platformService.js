//thieu env
const deployToPlatform = async (
  app_id,
  deployment_order,
  owner,
  name,
  branch,
) => {
  const body = { app_id, deployment_order, owner, name, branch };
  const response = await fetch("http://vitomate.com:4001/api/builders/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};
module.exports = { deployToPlatform };
