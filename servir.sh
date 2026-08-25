#!/usr/bin/env bash
# Sobe o TrashTime num servidor local.
# É assim que ele funciona como aplicativo instalável: abrindo o arquivo
# direto (file://) o navegador bloqueia o service worker.
cd "$(dirname "$0")" || exit 1
echo "TrashTime em http://localhost:8000"
echo "Para instalar no celular, use o IP desta máquina na mesma rede."
echo "Ctrl+C encerra."
python3 -m http.server 8000
