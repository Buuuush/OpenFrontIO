commandes :

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

echo 'export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc && source ~/.bashrc

source ~/.bashrc  # ou ~/.zshrc selon votre shell
nvm install 20.19.1
nvm use 20.19.1

npm inst
npm run inst
npm run dev
