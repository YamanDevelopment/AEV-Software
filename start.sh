#!/usr/bin/env bash

# tmux new-session -d 'bash'
# tmux split-window -h 'fish'
# tmux split-window -h

tmux new-session -d "bash -c 'cd src/frontend && npm run dev && cat'"
tmux split-window -h "bash -c 'cd src/serialport && sudo npm start && cat'"

kitty --detach --title "debug" "./tmux.sh"
