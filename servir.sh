#!/usr/bin/env bash
# Gera a versão publicável e a serve, para testar o app como ele fica de
# verdade — inclusive o service worker, que só funciona servido por HTTP.
#
# Para o dia a dia de desenvolvimento use `npm run dev`, que recarrega
# sozinho a cada alteração.
cd "$(dirname "$0")" || exit 1

if [ ! -d node_modules ]; then
    echo "Instalando as dependências (só na primeira vez)..."
    npm install || exit 1
fi

npm run build || exit 1
echo
echo "TrashTime em http://localhost:4173"
echo "Para abrir no celular, use o IP desta máquina na mesma rede."
echo "Ctrl+C encerra."
npm run preview -- --host --port 4173
