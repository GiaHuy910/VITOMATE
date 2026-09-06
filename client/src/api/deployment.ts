const baseApi = "http://localhost:4000";

export const deploy = async (deployForm: any) => {
  await fetch(`${baseApi}/api/builders/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(deployForm),
  });
};
