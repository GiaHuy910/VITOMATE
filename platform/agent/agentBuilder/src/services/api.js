const config = require("../config/config");

async function pollMaster() {
  const url = `http://${config.MASTER_URL}/api/builders/poll?worker_id=${config.WORKER_ID}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${config.AGENT_TOKEN}`,
      },
    });
    if (res.status === 204) {
      console.log("No jobs in the queue.");
      return null;
    }

    if (res.status === 200) {
      console.log("Get a job in the queue.");
      const job = await res.json();
      return job;
    }

    throw new Error(`Master http error: ${res.status}`);
  } catch (err) {
    throw new Error(`Unable to connect to Master: ${err.message}`);
  }
}

async function reportJobResultToMaster(result) {
  const url = `http://${config.MASTER_URL}/api/builders/callback`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${config.AGENT_TOKEN}`,
      },
      body: JSON.stringify(result),
    });

    const responseData = await res.text();

    if (res.ok) {
      console.log(
        `[REPORT SUCCESS] Image info has been sent to Master: [${result.image_tag}].`,
      );
      return responseData;
    } else {
      console.error(`[REPORT FAILED] Master http error: ${res.status}`);
      throw new Error(`Master http error: ${res.status}`);
    }
  } catch (err) {
    console.error(
      `[REPORT FAILED] Unable to sent report to the Master:`,
      err.message,
    );
    throw err;
  }
}

module.exports = { pollMaster, reportJobResultToMaster };
