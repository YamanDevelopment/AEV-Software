#!/usr/bin/env bash

SESSION_NAME="AEV-Software"

tmux new-session -d -s $SESSION_NAME
tmux split-window -h 

tmux select-pane -t 0
tmux send-keys 'cd /root/aev-software/src/frontend' C-m 
tmux send-keys 'npm run dev && cat' C-m 

tmux select-pane -t 1 
tmux send-keys 'cd /root/aev-software/src/backend' C-m 
tmux send-keys 'sudo node main.js && cat' C-m 


kitty --detach --title "aev-debug" "/usr/bin/start_aev_tmux"
