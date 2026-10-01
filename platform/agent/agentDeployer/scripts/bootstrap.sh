#!/bin/bash
set -e

INSTALL_DIR="/opt/agent"

MASTER_URL="${MASTER_URL:?MASTER_URL is required}"
REGISTRY_URL="${REGISTRY_URL:?REGISTRY_URL is required}"
WORKER_ID="${WORKER_ID:?WORKER_ID is required}"
WORKER_HOST="${WORKER_HOST:?WORKER_HOST is required}"
AGENT_ROLE="${AGENT_ROLE:-DEPLOYER}"
AGENT_TOKEN="${AGENT_TOKEN:?AGENT_TOKEN is required}"

# Đọc cờ IS_UPDATE
# Mặc định là false nếu không truyền
IS_UPDATE="${IS_UPDATE:-false}"

wait_for_apt() {
    echo "===> Kiểm tra APT/DPKG lock..."

    local max_wait=300
    local waited=0

    while \
        fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 ||
        fuser /var/lib/dpkg/lock >/dev/null 2>&1 ||
        fuser /var/lib/apt/lists/lock >/dev/null 2>&1 ||
        fuser /var/cache/apt/archives/lock >/dev/null 2>&1
    do
        if [ "$waited" -ge "$max_wait" ]; then
            echo "[ERROR] APT/DPKG vẫn đang bị khóa sau ${max_wait} giây."
            echo "===> Các process đang sử dụng APT/DPKG:"

            fuser -v \
                /var/lib/dpkg/lock-frontend \
                /var/lib/dpkg/lock \
                /var/lib/apt/lists/lock \
                /var/cache/apt/archives/lock \
                2>/dev/null || true

            return 1
        fi

        echo "===> APT/DPKG đang bận. Đợi 5 giây..."
        sleep 5
        waited=$((waited + 5))
    done

    echo "===> APT/DPKG đã sẵn sàng."
}

# ==========================================================
# FIRST BOOTSTRAP / UPDATE
# ==========================================================

if [ "$IS_UPDATE" = "true" ]; then

    echo "=========================================================="
    echo "===> [UPDATE MODE] Phát hiện cờ IS_UPDATE=true"
    echo "===> Bỏ qua cài đặt hệ thống nếu đã tồn tại..."
    echo "=========================================================="

else

    echo "=========================================================="
    echo "===> [FIRST BOOTSTRAP MODE] Tiến hành cài đặt hệ thống..."
    echo "=========================================================="

    echo "===> [0/5] Chờ APT/DPKG sẵn sàng..."

    export DEBIAN_FRONTEND=noninteractive

    wait_for_apt

    dpkg --configure -a

    wait_for_apt

    # ==========================================================
    # [1/5] CÀI ĐẶT DEPENDENCIES
    # ==========================================================

    echo "===> [1/5] Cập nhật hệ thống và cài đặt gói phụ thuộc..."

    export NEEDRESTART_MODE=a
    export NEEDRESTART_SUSPEND=1

    wait_for_apt

    apt-get update -y

    wait_for_apt

    apt-get install -y \
      -o Dpkg::Options::="--force-confdef" \
      -o Dpkg::Options::="--force-confold" \
      curl wget git docker.io ca-certificates jq nodejs npm

fi


# ==========================================================
# ĐẢM BẢO DOCKER TỒN TẠI
# Áp dụng cho cả FIRST BOOTSTRAP và UPDATE
# ==========================================================

echo "===> Kiểm tra Docker..."

if ! command -v docker >/dev/null 2>&1; then

    echo "===> Docker chưa được cài đặt. Đang cài Docker..."

    export DEBIAN_FRONTEND=noninteractive

    wait_for_apt

    apt-get update -y

    wait_for_apt

    apt-get install -y \
      -o Dpkg::Options::="--force-confdef" \
      -o Dpkg::Options::="--force-confold" \
      docker.io

else

    echo "===> Docker đã được cài đặt:"
    docker --version

fi

# ==========================================================
# ĐẢM BẢO NODE.JS TỒN TẠI
# Áp dụng cho cả FIRST BOOTSTRAP và UPDATE
# ==========================================================

echo "===> Kiểm tra Node.js..."

if ! command -v node >/dev/null 2>&1; then

    echo "===> Node.js chưa được cài đặt. Đang cài Node.js..."

    export DEBIAN_FRONTEND=noninteractive

    wait_for_apt

    apt-get update -y
    
    wait_for_apt

    apt-get install -y \
      -o Dpkg::Options::="--force-confdef" \
      -o Dpkg::Options::="--force-confold" \
      nodejs npm

else

    echo "===> Node.js đã được cài đặt:"
    node --version

fi

# ==========================================================
# CẤU HÌNH DOCKER INSECURE REGISTRY
# Áp dụng cho cả FIRST BOOTSTRAP và UPDATE
# ==========================================================

echo "===> Cấu hình Docker Insecure Registry cho Master Node (${REGISTRY_URL})..."

mkdir -p /etc/docker

if [ -f "/etc/docker/daemon.json" ] && [ -s "/etc/docker/daemon.json" ]; then

    TMP_JSON=$(mktemp)

    jq --arg reg "$REGISTRY_URL" '
      if .["insecure-registries"] then
        .["insecure-registries"] =
          ((.["insecure-registries"] + [$reg]) | unique)
      else
        . + {"insecure-registries": [$reg]}
      end
    ' /etc/docker/daemon.json > "$TMP_JSON"

    mv "$TMP_JSON" /etc/docker/daemon.json

else

    cat <<EOF > /etc/docker/daemon.json
{
  "insecure-registries": ["${REGISTRY_URL}"]
}
EOF

fi


# ==========================================================
# KHỞI ĐỘNG DOCKER
# ==========================================================

echo "===> Kích hoạt Docker..."

systemctl enable docker
systemctl restart docker

echo "===> Kiểm tra Docker service..."

if ! systemctl is-active --quiet docker; then

    echo "[ERROR] Docker không thể khởi động."

    systemctl status docker --no-pager

    exit 1

fi

echo "===> Docker đang hoạt động."


# ==========================================================
# [4/5] CẤU HÌNH DEPLOYER AGENT
# Áp dụng cho cả FIRST BOOTSTRAP và UPDATE
# ==========================================================

echo "===> [4/5] Cấu hình thư mục chứa Agent và Service..."

# ----------------------------------------------------------
# QUAN TRỌNG:
# Không xóa toàn bộ /opt/agent
# vì Deployer có thể đang chứa apps đã deploy.
# ----------------------------------------------------------

mkdir -p "${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}/apps"


# ----------------------------------------------------------
# Đồng bộ source code Agent
# ----------------------------------------------------------

if [ -d "/tmp/agent" ]; then

    echo "===> Đồng bộ source code Agent..."

    cp -r /tmp/agent/. "${INSTALL_DIR}/"

else

    echo "[WARN] Không tìm thấy /tmp/agent"

fi


# ==========================================================
# CẬP NHẬT FILE ENV
# ==========================================================

echo "===> Cập nhật file cấu hình Agent..."

mkdir -p /etc/paas-agent

cat <<EOF > /etc/paas-agent/agent.env
MASTER_URL=${MASTER_URL}
REGISTRY_URL=${REGISTRY_URL}
WORKER_ID=${WORKER_ID}
WORKER_HOST=${WORKER_HOST}
AGENT_ROLE=${AGENT_ROLE}
AGENT_TOKEN=${AGENT_TOKEN}
EOF

chmod 600 /etc/paas-agent/agent.env


# ==========================================================
# CẤU HÌNH SYSTEMD SERVICE
# ==========================================================

SERVICE_SRC=""

if [ -f "${INSTALL_DIR}/scripts/agent.service" ]; then

    SERVICE_SRC="${INSTALL_DIR}/scripts/agent.service"

elif [ -f "${INSTALL_DIR}/agent.service" ]; then

    SERVICE_SRC="${INSTALL_DIR}/agent.service"

fi


if [ -n "$SERVICE_SRC" ]; then

    echo "===> Cập nhật systemd service..."

    cp "$SERVICE_SRC" /etc/systemd/system/agent.service

    systemctl daemon-reload

    systemctl enable agent.service

    systemctl restart agent.service

else

    echo "[WARN] Không tìm thấy file agent.service, bỏ qua bước khởi tạo Systemd."

fi


# ==========================================================
# [5/5] THU THẬP THÔNG TIN WORKER
# ==========================================================

echo "===> [5/5] Thu thập thông số phần cứng và Báo cáo về Master..."

WORKER_IP=$(hostname -I | awk '{print $1}')

CPU_CORES=$(nproc)

TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')

FREE_DISK_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')


# ==========================================================
# REGISTER WORKER
# ==========================================================

curl -X POST "http://${MASTER_URL}/api/workers/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AGENT_TOKEN}" \
  -d '{
    "worker_id": "'"${WORKER_ID}"'",
    "host": "'"${WORKER_IP}"'",
    "cpu_cores": '"${CPU_CORES}"',
    "total_ram_mb": '"${TOTAL_RAM_MB}"',
    "free_disk_gb": '"${FREE_DISK_GB}"',
    "role": "'"${AGENT_ROLE}"'",
    "status": "READY"
  }'


echo "===> HOÀN TẤT! Agent [${WORKER_ID}] (Update: ${IS_UPDATE}) đã sẵn sàng."