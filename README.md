# Bless Network Bot 
This script automates network or node operations for Bless Network Bot.

## Register Bless Network
- https://bless.network/dashboard?ref=BYCAF2

## Features
- **Automated node interaction**
- **Real-time reward tracking**
- **Auto session refresh**
- **Connection status monitoring**
- **Detailed statistics logging**

## Installation
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/caraka15/bless.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Bless-Bot
   ```

3. Install the necessary dependencies:
   ```bash
   npm install
   ```

## Usage
1. Register to blockless bless network account first, if you don't have you can register [here](https://bless.network/dashboard?ref=BYCAF2).

2. Create and modify `config.json`. Below is the format:
   ```json
   {
       "nodeId": "12D3KooWxxxxxx",
       "hardwareId": "your-hardware-id",
       "authToken": "eyJhbGcxxxxx",
       "version": "0.1.7"
   }
   ```

   To get your authToken:
   - Login to your bless account at `https://bless.network/dashboard`
   - Open browser developer tools (F12)
   - Go to Application tab -> Local Storage -> https://bless.network
   - Find B7S_AUTH_TOKEN
   - Or run this in Console tab:
     ```javascript
     localStorage.getItem('B7S_AUTH_TOKEN')
     ```
      if error, run "allow pasting" and enter

3. Run using screen:
   ```bash
   # Create new screen session named bless
   screen -S bless
   
   # Start the bot
   node app.js
   
   # Detach from screen: press Ctrl+A then D
   
   # To reattach to screen session later:
   screen -Rd bless
   ```

## Features & Intervals
- Ping: Every 60 seconds
- Status Check: Every 2 minutes
- Session Refresh: Every 5 minutes
- Real-time statistics display
- Automatic error recovery
- Reward tracking

**NOTE: 
- One account can have maximum 5 nodeIds
- NodeIds cannot be deleted once created
- Recommended to save your authToken for future use
- The bot will automatically refresh sessions and maintain connection
- Use `Ctrl+A then D` to detach from screen
- Use `screen -Rd bless` to reattach to bot screen**

## Monitoring
The bot provides real-time monitoring of:
- Connection status
- Today's rewards
- Total rewards
- Session age
- Ping statistics
- Uptime tracking