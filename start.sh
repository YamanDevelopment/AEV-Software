#!/usr/bin/env bash

# Start Apps
export GTK_THEME=Catppuccin-Mocha-Standard-Mauve-Dark
export XDG_CURRENT_DESKTOP=gnome 

gnome-control-center &
soundux &
lollypop &
# freetube --no-sandbox &

# Start Dashboard

SESSION_NAME="AEV-Software"

tmux new-session -d -s $SESSION_NAME
tmux split-window -h 

tmux select-pane -t 0
tmux send-keys 'cd /root/aev-software/src/frontend' C-m 
tmux send-keys 'npm run dev && cat' C-m 

tmux select-pane -t 1 
tmux send-keys 'cd /root/aev-software/src/backend' C-m 
tmux send-keys 'sudo node main.js && cat' C-m 

# More Debug Stuff
DEBUG_SESSION_NAME="AEV-Debug"

tmux new-session -d -s $DEBUG_SESSION_NAME
tmux split-window -h 

tmux select-pane -t 0
tmux send-keys 'gping 1.1.1.1' C-m
tmux select-pane -t 1
# tmux send-keys 'wg-quick up AEV-CarPi && cat' C-m
tmux send-keys 'ifconfig' C-m

kitty --detach --title "aev-debug" "/usr/bin/start_aev_tmux"
