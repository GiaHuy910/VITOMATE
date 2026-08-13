const vmManager = require("../vm/vm.manager");

class VMService {
  createVM(data) {
    return vmManager.createVM(data);
  }

  getVM(id) {
    return vmManager.getVM(id);
  }

  getAllVMs() {
    return vmManager.getAllVMs();
  }

  updateVM(id, data) {
    return vmManager.updateVM(id, data);
  }

  deleteVM(id) {
    return vmManager.deleteVM(id);
  }
}

module.exports = new VMService();
