#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Navigate to the application directory
cd /root/etvb_wrap_app

# Run the serve command
/root/.nvm/versions/node/v20.14.0/bin/serve -s dist -l 5000

