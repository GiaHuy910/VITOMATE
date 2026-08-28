#!/bin/bash

# 1. Dừng script ngay lập tức nếu bất kỳ lệnh nào bị lỗi
set -e

# 2. Khai báo biến với giá trị mặc định nếu chưa truyền từ ngoài vào
INSTALL_DIR="/opt/agent"
MASTER_URL="${MASTER_URL:-http://192.168.1.18:8000}"
WORKER_ID="${WORKER_ID:-worker-node-01}"

# Tách IP/Host và Cổng từ MASTER_URL để cấu hình Registry (mặc định dùng port 5000)
MASTER_HOST=$(echo "$MASTER_URL" | sed -e 's|:[0-9]*$||' -e 's|^https*://||')
REGISTRY_URL="${MASTER_HOST}:5000"

echo "===> [1/5] Cập nhật hệ thống và cài đặt gói phụ thuộc..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git docker.io ca-certificates jq

echo "===> [2/5] Cấu hình Docker Insecure Registry cho Master Node (${REGISTRY_URL})..."
mkdir -p /etc/docker

# Kiểm tra nếu /etc/docker/daemon.json đã tồn tại
if [ -f "/etc/docker/daemon.json" ] && [ -s "/etc/docker/daemon.json" ]; then
    # Thêm hoặc cập nhật mảng insecure-registries bằng jq để bảo toàn các config Docker khác
    TMP_JSON=$(mktemp)
    jq --arg reg "$REGISTRY_URL" '
      if .["insecure-registries"] then
        .["insecure-registries"] = ((.["insecure-registries"] + [$reg]) | unique)
      else
        . + {"insecure-registries": [$reg]}
      end
    ' /etc/docker/daemon.json > "$TMP_JSON" && mv "$TMP_JSON" /etc/docker/daemon.json
else
    # Nếu chưa có file daemon.json thì khởi tạo mới
    cat <<EOF > /etc/docker/daemon.json
{
  "insecure-registries": ["${REGISTRY_URL}"]
}
EOF
fi

echo "===> [3/5] Kích hoạt và cho phép Docker tự chạy cùng OS..."
systemctl enable --now docker
systemctl restart docker

echo "===> [4/5] Cấu hình thư mục chứa Agent..."
mkdir -p "${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}/apps"

# Move file entry point chính index.js
if [ -f "/tmp/index.js" ]; then
    mv /tmp/index.js "${INSTALL_DIR}/index.js"
fi

# Move thư mục agent chứa các module con (api.js, executor.js, handlers,...)
if [ -d "/tmp/agent" ]; then
    rm -rf "${INSTALL_DIR}/agent"
    mv /tmp/agent "${INSTALL_DIR}/agent"
fi

# Move file service vào Systemd
if [ -f "/tmp/agent.service" ]; then
    mv /tmp/agent.service /etc/systemd/system/agent.service
fi

# Thay thế linh hoạt IP Master Server và Worker ID vào file Service bằng lệnh 'sed'
sed -i "s|Environment=MASTER_URL=.*|Environment=MASTER_URL=${MASTER_URL}|g" /etc/systemd/system/agent.service
sed -i "s|Environment=WORKER_ID=.*|Environment=WORKER_ID=${WORKER_ID}|g" /etc/systemd/system/agent.service

echo "===> [5/5] Khởi động Agent Service..."
systemctl daemon-reload
systemctl enable agent
systemctl restart agent

echo "===> SETUP HOÀN TẤT! Worker Agent đã khởi chạy."