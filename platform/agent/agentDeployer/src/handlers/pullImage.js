const { exec } = require("child_process");
const Config = require("../config/config");

// Chạy command shell và chờ command hoàn thành
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr?.trim() || error.message));
        return;
      }

      resolve(stdout.trim());
    });
  });
}

// Login vào Docker Registry
async function loginRegistry(registryUrl, username, password) {
  console.log(`[Docker] Login registry: ${registryUrl}`);

  await execCommand(
    `echo ${JSON.stringify(password)} | docker login ${registryUrl} -u ${JSON.stringify(username)} --password-stdin`,
  );

  console.log(`[Docker] Registry login success`);
}

async function pullImage(image_tag, registryAuth = null) {
  try {
    // Nếu registry yêu cầu authentication
    if (registryAuth?.username && registryAuth?.password) {
      await loginRegistry(
        Config.registry.url,
        registryAuth.username,
        registryAuth.password,
      );
    }

    console.log(`[Docker] Pulling image: ${image_tag}`);

    await execCommand(`docker pull ${image_tag}`);

    console.log(`[Docker] Pull success: ${image_tag}`);
  } catch (error) {
    throw new Error(`Failed to pull image ${image_tag}: ${error.message}`);
  }
}

module.exports = { pullImage };
