const vmService = require("../services/vm.service");

function createVM(req, res) {
  try {
    const vm = vmService.createVM(req.body);

    res.status(201).json({
      success: true,
      data: vm,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create VM",
    });
  }
}

function getAllVMs(req, res) {
  try {
    const vms = vmService.getAllVMs();

    res.status(200).json({
      success: true,
      data: vms,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get VMs",
    });
  }
}

function getVM(req, res) {
  try {
    const vm = vmService.getVM(req.params.id);

    if (!vm) {
      return res.status(404).json({
        success: false,
        message: "VM not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vm,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get VM",
    });
  }
}

function updateVM(req, res) {
  try {
    const vm = vmService.updateVM(req.params.id, req.body);

    if (!vm) {
      return res.status(404).json({
        success: false,
        message: "VM not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vm,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update VM",
    });
  }
}

function deleteVM(req, res) {
  try {
    const deleted = vmService.deleteVM(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "VM not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "VM deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete VM",
    });
  }
}

module.exports = {
  createVM,
  getAllVMs,
  getVM,
  updateVM,
  deleteVM,
};
