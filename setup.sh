#!/usr/bin/env bash

# Tested OS: Arch Linux for ARM
# Requirements: node, npm, git, tmux, gpsd

# Clone the repository
# echo "Cloning the repository..."
# git clone https://github.com/jeebuscrossaint/aev-software ~/aev-software

# Symlink Hyprland and AGS configuration
echo "Symlinking Hyprland and AGS configuration..."
mv ~/.config/hypr ~/.config/hypr.bak
ln -sf ~/aev-software/src/hyprland/config/hypr ~/.config/hypr
mv ~/.config/ags ~/.config/ags.bak
ln -sf ~/aev-software/src/hyprland/config/ags ~/.config/ags

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ~/aev-software/src/frontend
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd ~/aev-software/src/backend
npm install

# Install system dependencies
echo "Installing system dependencies (may require superuser priveleges)..."
sudo pacman -S npm hyprland gpsd node git tmux kitty 
# Should prob install AUR packages here but doesn't really matter rn will do so later - Thandi

# Setup binaries
echo "Setting up binaries..."
ln -sf ~/aev-software/bin/start_aev_tmux /usr/bin/start_aev_tmux
ln -sf ~/aev-software/bin/amplitude /usr/bin/amplitude