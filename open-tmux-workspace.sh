#!/bin/bash

# Define session name
SESSION_NAME="train-tracker"

# Start a new tmux session or attach to the existing one
tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? != 0 ]; then
    # Create a new session
    tmux new-session -d -s $SESSION_NAME 

    # Set up the first window/pane
    tmux send-keys -t $SESSION_NAME 'cd ~/personal_projects/Personal-Train-Tracker' C-m
    tmux send-keys -t $SESSION_NAME 'open -a Firefox index.html' C-m
    tmux send-keys -t $SESSION_NAME 'nvim app.js' C-m

    # Split window horizontally and run a command in the new pane
    tmux split-window -h -t $SESSION_NAME
    tmux send-keys -t $SESSION_NAME 'cd ~/personal_projects/Simple-Train-Tracker-App-Server' C-m
    tmux send-keys -t $SESSION_NAME 'nvim server.js' C-m

    tmux split-window -v -t $SESSION_NAME
    tmux send-keys -t $SESSION_NAME 'cd ~/personal_projects/Simple-Train-Tracker-App-Server' C-m
    tmux send-keys -t $SESSION_NAME 'npm run dev' C-m
fi

# Attach to session
tmux attach -t $SESSION_NAME

