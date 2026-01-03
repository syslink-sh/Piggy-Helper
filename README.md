<div align="center">
  <h1>Piggy Helper</h1>
  <p>A specialized Discord bot for managing help requests and support tickets with team availability tracking.</p>
  <p>
</div>

## About

Piggy Helper is a request management utility designed for Discord comunidades where support or task requests need to be tracked and handled by a specific group of "Helpers". It streamlines the lifecycle of a request from creation to resolution, ensuring that available human resources are properly utilized and actions are logged for accountability.

The project solves the problem of chaotic support channels by providing a structured Command-Line Interface (CLI) within Discord, simulating a ticket-based system without the overhead of external web platforms. It is built with a philosophy of minimal friction for both the user and the helper.

## Features

- **Automated Setup**: Interactive slash command to configure guild-specific channels and categories.
- **Availability Tracking**: Helpers can toggle their status, allowing users to see who is currently active.
- **Structured Request Handling**: Specialized commands to close requests and log outcomes.
- **Centralized Configuration**: Environment-driven setup ensures high Portability and security.
- **Event-Driven Architecture**: Clean separation of concerns between command handling and internal event logic.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.11.0 or higher)
- [npm](https://www.npmjs.com/)
- Discord Bot Token with `Guilds` intents enabled

### Step-by-step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/syslink-sh/Piggy-Helper.git
   cd Piggy-Helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables)).

4. **Deploy Slash Commands**
   ```bash
   npm run deploy-commands
   ```

## Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DISCORD_TOKEN` | Discord Bot Token from Developer Portal | `OT...` |
| `CLIENT_ID` | Application ID of your bot | `1234...` |
| `GUILD_ID` | Target Guild ID for instant command deployment | `5678...` |
| `REQUESTS_CHANNEL_ID` | Public channel for new help requests | `9012...` |
| `CATEGORY_ID` | Category ID where request channels are created | `3456...` |
| `LOG_CHANNEL_ID` | Internal log channel for bot actions | `7890...` |
| `HELPER_ROLE_ID` | Role ID assigned to authorized Helpers | `1212...` |

## Running the Application

### Development Mode
Runs the bot with standard logging and immediate startup.
```bash
npm start
```