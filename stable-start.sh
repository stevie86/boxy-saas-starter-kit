#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

SESSION_NAME="hostelpulse"

echo -e "${BLUE}Configuring HostelPulse deployment inside tmux...${NC}"

# Check if tmux session exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo -e "${YELLOW}Existing session '$SESSION_NAME' found. Killing it for a fresh start...${NC}"
  tmux kill-session -t $SESSION_NAME
fi

# Create new detached session

echo -e "${BLUE}Creating new tmux session: $SESSION_NAME${NC}"

tmux new-session -d -s $SESSION_NAME 'bash -l' # -l for login shell, which sources .bashrc, etc.

sleep 1 # Give tmux a moment to initialize the session



# Send commands to the tmux session

# Commands to run inside the tmux session

tmux send-keys -t $SESSION_NAME "echo 'Starting development server...'" C-m

sleep 0.5

tmux send-keys -t $SESSION_NAME "pnpm dev" C-m

sleep 0.5



echo -e "${GREEN}Development server started in background!${NC}"

echo -e "${BLUE}To view progress and logs, run:${NC}"

echo -e "${GREEN}tmux attach -t $SESSION_NAME${NC}"

echo -e "(Press 'Ctrl+b' then 'd' to detach again)"

echo -e "${YELLOW}Access the app at: http://localhost:3000${NC}"