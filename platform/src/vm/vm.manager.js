const { randomUUID } = require("crypto");

const vmRegistry = require("./vm.registry");

class VMManager {
  createVM(data = {}) {
    const vm = {
      id: `vm-${randomUUID()}`,

      name: data.name || "unnamed-vm",

      hostname: data.hostname || null,

      ipAddress: data.ipAddress || null,

      status: "PROVISIONING",

      agentStatus: "NOT_REGISTERED",

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    vmRegistry.add(vm);

    return vm;
  }

  getVM(id) {
    return vmRegistry.getById(id);
  }

  getAllVMs() {
    return vmRegistry.getAll();
  }

  updateVM(id, data) {
    return vmRegistry.update(id, data);
  }

  deleteVM(id) {
    return vmRegistry.remove(id);
  }
}

module.exports = new VMManager();
