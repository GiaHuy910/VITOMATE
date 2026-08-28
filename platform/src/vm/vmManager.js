class VMManager {
  constructor() {
    // Lưu danh sách các VM trong bộ nhớ (Memory/Database)
    this.workers = new Map();
  }

  // Đăng ký một máy ảo mới vào hệ thống
  registerVM(vmData) {
    const vm = {
      id: vmData.id,
      host: vmData.host,
      status: "PENDING", // PENDING -> BOOTSTRAPPING -> READY -> OFFLINE
      lastSeen: null,
      pendingCommands: [], // Hàng chờ các lệnh Master muốn gửi cho VM này
    };
    this.workers.set(vm.id, vm);
    return vm;
  }

  // Cập nhật trạng thái khi Agent gửi Heartbeat/Poll
  updateHeartbeat(workerId) {
    const vm = this.workers.get(workerId);
    if (vm) {
      vm.status = "READY";
      vm.lastSeen = new Date();
    }
  }

  // Thêm lệnh vào hàng chờ để gửi cho Agent trong lần Poll tiếp theo
  addCommand(workerId, command) {
    const vm = this.workers.get(workerId);
    if (vm) {
      vm.pendingCommands.push(command);
    }
  }

  // Lấy ra lệnh đang chờ xử lý
  getPendingCommand(workerId) {
    const vm = this.workers.get(workerId);
    if (vm && vm.pendingCommands.length > 0) {
      return vm.pendingCommands.shift(); // Lấy lệnh đầu tiên ra
    }
    return null;
  }
}

module.exports = new VMManager();
