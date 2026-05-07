#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker 命令。请先安装并启动 Docker Desktop，或在 Linux 上安装 Docker Engine。" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "错误：当前 Docker 不支持 'docker compose'。请安装 Docker Compose v2。" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "错误：未找到 $COMPOSE_FILE。请在项目根目录运行本脚本。" >&2
  exit 1
fi

echo "==> 使用配置文件：$PROJECT_ROOT/$COMPOSE_FILE"
echo "==> 构建并启动 MySQL 8.0.25 与知识库应用..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "==> 当前容器状态："
docker compose -f "$COMPOSE_FILE" ps

echo "==> 等待应用就绪：$APP_URL"
for attempt in {1..60}; do
  if curl -fsS "$APP_URL" >/dev/null 2>&1; then
    echo "==> 部署完成：$APP_URL"
    echo "==> MySQL 数据保存在 Docker volume：ai-my_kbs_mysql_data 或当前 Compose 项目的 mysql_data。"
    exit 0
  fi

  if (( attempt % 10 == 0 )); then
    echo "    应用仍在启动中...（第 ${attempt} 次检查）"
  fi
  sleep 2
done

echo "警告：应用没有在预期时间内响应。请查看日志：" >&2
echo "  docker compose -f $COMPOSE_FILE logs -f app" >&2
echo "  docker compose -f $COMPOSE_FILE logs -f mysql" >&2
exit 1
