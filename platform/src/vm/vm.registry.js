class VMRegistry {
  constructor() {
    this.vms = new Map();
  }

  add(vm) {
    this.vms.set(vm.id, vm);

    return vm;
  }

  getById(id) {
    return this.vms.get(id) || null;
  }

  getAll() {
    return Array.from(this.vms.values());
  }

  update(id, data) {
    const vm = this.vms.get(id);

    if (!vm) {
      return null;
    }

    const updatedVM = {
      ...vm,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.vms.set(id, updatedVM);

    return updatedVM;
  }

  remove(id) {
    return this.vms.delete(id);
  }

  exists(id) {
    return this.vms.has(id);
  }
}

module.exports = new VMRegistry();
