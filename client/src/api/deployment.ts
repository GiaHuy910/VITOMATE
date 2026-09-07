import { config } from "../config/url";
const baseApi = `${config.server_2_url_dev}`;

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
