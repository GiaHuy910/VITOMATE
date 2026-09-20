#!/bin/bash
set -e

INSTALL_DIR="/opt/agent"

MASTER_URL="${MASTER_URL:?MASTER_URL is required}"
REGISTRY_URL="${REGISTRY_URL:?REGISTRY_URL is required}"
WORKER_ID="${WORKER_ID:?WORKER_ID is required}"
AGENT_ROLE="${AGENT_ROLE:?AGENT_ROLE is required}"
AGENT_TOKEN="${AGENT_TOKEN:?AGENT_TOKEN is required}"

# SỬA 1: Đọc cờ IS_UPDATE (mặc định là false nếu không truyền)
IS_UPDATE="${IS_UPDATE:-false}"

if [ "$IS_UPDATE" = "true" ]; then
    echo "=========================================================="
    echo "===> [UPDATE MODE] Phát hiện cờ IS_UPDATE=true"
    echo "===> Bỏ qua bước cài đặt gói/Docker, tiến hành Sync Code..."
    echo "=========================================================="
else
    echo "=========================================================="
    echo "===> [FIRST BOOTSTRAP MODE] Tiến hành cài đặt hệ thống..."
    echo "=========================================================="

    # SỬA 2: Bọc toàn bộ bước Cài đặt nặng vào trong khối ELSE

    echo "===> [0/5] Vô hiệu hóa và tiêu diệt tiến trình apt/dpkg ngầm..."
    export DEBIAN_FRONTEND=noninteractive

    systemctl mask unattended-upgrades.service 2>/dev/null || true
    systemctl stop unattended-upgrades.service 2>/dev/null || true

    killall -9 apt apt-get dpkg unattended-upgrade unattended-upgr 2>/dev/null || true

    rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock /var/cache/apt/archives/lock

    dpkg --configure -a 2>/dev/null || true

    echo "===> [1/5] Cập nhật hệ thống và cài đặt gói phụ thuộc..."
    export NEEDRESTART_MODE=a
    export NEEDRESTART_SUSPEND=1

    apt-get update -y
    apt-get install -y \
      -o Dpkg::Options::="--force-confdef" \
      -o Dpkg::Options::="--force-confold" \
      curl wget git docker.io ca-certificates jq nodejs npm

    echo "===> [2/5] Cấu hình Docker Insecure Registry cho Master Node (${REGISTRY_URL})..."
    mkdir -p /etc/docker

    if [ -f "/etc/docker/daemon.json" ] && [ -s "/etc/docker/daemon.json" ]; then
        TMP_JSON=$(mktemp)
        jq --arg reg "$REGISTRY_URL" '
          if .["insecure-registries"] then
            .["insecure-registries"] = ((.["insecure-registries"] + [$reg]) | unique)
          else
            . + {"insecure-registries": [$reg]}
          end
        ' /etc/docker/daemon.json > "$TMP_JSON" && mv "$TMP_JSON" /etc/docker/daemon.json
    else
        cat <<EOF > /etc/docker/daemon.json
{
  "insecure-registries": ["${REGISTRY_URL}"]
}
EOF
    fi

    echo "===> [3/5] Kích hoạt Docker..."
    systemctl enable docker
    systemctl reload docker || systemctl restart docker || true
fi

# SỬA 3: Đồng bộ Code và Khởi động lại Service (Áp dụng cho cả 2 luồng)

echo "===> [4/5] Cấu hình thư mục chứa Agent và Service..."
mkdir -p "${INSTALL_DIR}"

# Đồng bộ dữ liệu từ /tmp/agent sang /opt/agent
if [ -d "/tmp/agent" ]; then
    cp -r /tmp/agent/. "${INSTALL_DIR}/"
fi

# Đảm bảo thư mục làm việc tạm thời cho Builder (workspace) luôn sạch sẽ
rm -rf "${INSTALL_DIR}/workspace"
mkdir -p "${INSTALL_DIR}/workspace"

echo "===> Cập nhật file cấu hình Agent..."

mkdir -p /etc/paas-agent

cat <<EOF > /etc/paas-agent/agent.env
MASTER_URL=${MASTER_URL}
WORKER_ID=${WORKER_ID}
AGENT_ROLE=${AGENT_ROLE}
AGENT_TOKEN=${AGENT_TOKEN}
EOF

chmod 600 /etc/paas-agent/agent.env

# Tìm file agent.service linh hoạt ở root hoặc folder scripts
SERVICE_SRC=""
if [ -f "${INSTALL_DIR}/scripts/agent.service" ]; then
    SERVICE_SRC="${INSTALL_DIR}/scripts/agent.service"
elif [ -f "${INSTALL_DIR}/agent.service" ]; then
    SERVICE_SRC="${INSTALL_DIR}/agent.service"
fi

if [ -n "$SERVICE_SRC" ]; then
    cp "$SERVICE_SRC" /etc/systemd/system/agent.service

    systemctl daemon-reload
    systemctl enable agent.service
    systemctl restart agent.service
else
    echo "[WARN] Không tìm thấy file agent.service, bỏ qua bước khởi tạo Systemd."
fi

echo "===> [5/5] Thu thập thông số phần cứng và Báo cáo về Master..."
WORKER_IP=$(hostname -I | awk '{print $1}')
CPU_CORES=$(nproc)
TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
FREE_DISK_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

curl -X POST "${MASTER_URL}/api/workers/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AGENT_TOKEN}" \
  -d '{
    "workerId": "'"${WORKER_ID}"'",
    "host": "'"${WORKER_IP}"'",
    "cpuCores": '"${CPU_CORES}"',
    "totalRamMb": '"${TOTAL_RAM_MB}"',
    "freeDiskGb": '"${FREE_DISK_GB}"',
    "role": "'"${AGENT_ROLE}"'",
    "status": "READY"
  }'

echo "===> HOÀN TẤT! Agent [${WORKER_ID}] (Update: ${IS_UPDATE}) đã sẵn sàng."