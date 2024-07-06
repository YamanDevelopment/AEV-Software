#!/bin/bash

# tmux new-session -d 'bash'
# tmux split-window -h 'fish'
# tmux split-window -h

# tmux new-session -d "bash -c 'cd src/frontend && npm run dev && cat'"
# tmux split-window -h "bash -c 'cd ../backend && sudo npm start && cat'"

# kitty --detach --title "debug" "./tmux.sh"

SESSION_NAME="AEV-Software"

# command_exists(){
#   command -v "$1" > /dev/null 2>&1
# }

# if command_exists kitty && command_exists hyprctl; then

#  kitty bash -c "

    tmux new-session -d -s $SESSION_NAME
    tmux split-window -h 

    tmux select-pane -t 0
    tmux send-keys 'cd /root/aev-software/src/frontend' C-m 
    tmux send-keys 'npm run dev && cat' C-m 

    tmux select-pane -t 1 
    tmux send-keys 'cd /root/aev-software/src/backend' C-m 
    tmux send-keys 'sudo node main.js && cat' C-m 

#    tmux attach -t $SESSION_NAME
#  " &

#  sleep 2
#  kitty_pid=$(pgrep -n kitty)
#  hyprctl dispatch movetoworkspace 5 address:$kitty_pid
# fi

kitty --detach --title "aev-debug" "./tmux.sh"
