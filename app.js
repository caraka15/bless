// bot.js
const axios = require('axios');
const fs = require('fs').promises;
const chalk = require('chalk');

let config;
const API_BASE_URL = "https://gateway-run.bls.dev/api/v1";

// Fungsi untuk format timestamp
function getTimestamp() {
    return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
}

// Fungsi logging
function logInfo(message) {
    console.log(`${getTimestamp()} ${chalk.blue('ℹ')} ${message}`);
}

function logSuccess(message) {
    console.log(`${getTimestamp()} ${chalk.green('✓')} ${message}`);
}

function logError(message) {
    console.log(`${getTimestamp()} ${chalk.red('✗')} ${message}`);
}

function logWarning(message) {
    console.log(`${getTimestamp()} ${chalk.yellow('⚠')} ${message}`);
}

function logSystem(message) {
    console.log(`${getTimestamp()} ${chalk.magenta('⚡')} ${message}`);
}

// Fungsi format rewards
function formatReward(reward) {
    return chalk.yellow(`${reward.toFixed(2)}`);
}

// Format time function
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

// Fungsi untuk membaca config
async function loadConfig() {
    try {
        const data = await fs.readFile('config.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logError(`Failed to load config: ${error.message}`);
        process.exit(1);
    }
}

// Fungsi untuk check status node
async function checkNodeStatus() {
    const statusUrl = `${API_BASE_URL}/nodes/${config.nodeId}`;
    const response = await axios.get(statusUrl, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        }
    });

    const data = response.data;
    const lastSession = data.sessions[data.sessions.length - 1];
    const sessionAge = Math.floor((new Date() - new Date(lastSession.startAt)) / 1000);

    console.log(chalk.gray('\n─'.repeat(70)));
    logSystem(`Node Status Update:`);
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`${chalk.blue('🔌')} Connection: ${data.isConnected ? chalk.green('Connected') : chalk.red('Disconnected')}`);
    console.log(`${chalk.yellow('💰')} Today's Reward: ${formatReward(data.todayReward)}`);
    console.log(`${chalk.yellow('🏦')} Total Reward: ${formatReward(data.totalReward)}`);
    console.log(`${chalk.blue('📡')} Node Version: ${chalk.cyan(data.extensionVersion)}`);
    console.log(`${chalk.blue('⏰')} Session Age: ${chalk.cyan(formatTime(sessionAge))}`);
    console.log(chalk.gray('─'.repeat(70)));

    return data;
}

// Fungsi mendaftarkan node
async function registerNode() {
    const registerUrl = `${API_BASE_URL}/nodes/${config.nodeId}`;
    logInfo(`Registering node ${chalk.cyan(config.nodeId.substring(0, 16))}...`);

    const response = await axios.post(registerUrl, {
        hardwareId: config.hardwareId,
        extensionVersion: config.version
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        }
    });

    logSuccess(`Node registered successfully`);
    return response.data;
}

// Fungsi memulai sesi
async function startSession() {
    const startSessionUrl = `${API_BASE_URL}/nodes/${config.nodeId}/start-session`;
    logInfo(`Starting new session...`);

    const response = await axios.post(startSessionUrl, {
        startAt: new Date().toISOString(),
        extensionVersion: config.version
    }, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        }
    });

    const sessionId = response.data._id;
    logSuccess(`Session started - ID: ${chalk.cyan(sessionId)}`);
    return response.data;
}

// Fungsi ping node
async function pingNode() {
    const pingUrl = `${API_BASE_URL}/nodes/${config.nodeId}/ping`;

    const response = await axios.post(pingUrl, {
        timestamp: new Date().toISOString(),
        version: config.version
    }, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        }
    });

    const totalPings = response.data.pings?.length || 0;
    logSuccess(`Ping sent successfully (Total pings: ${chalk.cyan(totalPings)})`);
    return response.data;
}

// Header tampilan
function displayHeader() {
    console.clear();
    const customAsciiArt = chalk.cyan(`
     ██████╗██████╗ ██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ██████╗ ███████╗
    ██╔════╝██╔══██╗╚██╗██╔╝██╔══██╗████╗  ██║██╔═══██╗██╔══██╗██╔════╝
    ██║     ██████╔╝ ╚███╔╝ ███████║██╔██╗ ██║██║   ██║██║  ██║█████╗  
    ██║     ██╔══██╗ ██╔██╗ ██╔══██║██║╚██╗██║██║   ██║██║  ██║██╔══╝  
    ╚██████╗██║  ██║██╔╝ ██╗██║  ██║██║ ╚████║╚██████╔╝██████╔╝███████╗
     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
    `);

    console.log(customAsciiArt);
    console.log(chalk.yellow('\n                      BLESS NETWORK BOT'));
    console.log(chalk.blue('              Telegram : t.me/caraka15\n'));
    console.log(chalk.gray('═'.repeat(70)));
}

// Stats dan counter
let stats = {
    totalPings: 0,
    successfulPings: 0,
    failedPings: 0,
    startTime: new Date(),
    sessionRefreshes: 0,
    totalReward: 0,
    todayReward: 0
};

// Fungsi untuk menampilkan stats
function displayStats() {
    const uptime = Math.floor((new Date() - stats.startTime) / 1000);

    console.log(chalk.gray('\n═'.repeat(70)));
    logSystem(`Bot Statistics:`);
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`${chalk.blue('⌚')} Uptime: ${chalk.cyan(formatTime(uptime))}`);
    console.log(`${chalk.green('📊')} Total Pings: ${chalk.cyan(stats.totalPings)}`);
    console.log(`${chalk.green('✓')} Successful: ${chalk.cyan(stats.successfulPings)}`);
    console.log(`${chalk.red('✗')} Failed: ${chalk.cyan(stats.failedPings)}`);
    console.log(`${chalk.yellow('🔄')} Session Refreshes: ${chalk.cyan(stats.sessionRefreshes)}`);
    console.log(`${chalk.yellow('💰')} Today's Reward: ${formatReward(stats.todayReward)}`);
    console.log(`${chalk.yellow('🏦')} Total Reward: ${formatReward(stats.totalReward)}`);
    console.log(chalk.gray('═'.repeat(70)));
}

// Helper function untuk mengecek Cloudflare error
function isCloudflareError(error) {
    return error.response?.status === 403 && error.response?.data?.includes('Cloudflare');
}

// Helper function untuk mengekstrak Ray ID
function extractRayId(html) {
    const match = html.match(/Ray ID: (.*?)</);
    return match ? match[1] : 'Unknown';
}

// Fungsi untuk handle Cloudflare error
function handleCloudflareError(error) {
    if (isCloudflareError(error)) {
        const rayId = extractRayId(error.response.data);
        logError(`IP ADDRESS TERBLOKIR OLEH CLOUDFLARE`);
        logError(`Ray ID: ${rayId}`);
        logError(`Solusi: Gunakan VPN atau tunggu 24 jam`);
        return true;
    }
    return false;
}

// Fungsi utama
async function runAll() {
    try {
        displayHeader();

        config = await loadConfig();
        logSuccess(`Configuration loaded successfully`);

        // Initial status check
        const initialStatus = await checkNodeStatus();
        stats.todayReward = initialStatus.todayReward;
        stats.totalReward = initialStatus.totalReward;

        await registerNode();
        await startSession();
        stats.sessionRefreshes++;

        logInfo(`Starting ping cycle...`);
        await pingNode();
        stats.totalPings++;
        stats.successfulPings++;

        // Set interval untuk ping setiap 60 detik
        setInterval(async () => {
            try {
                await pingNode();
                stats.totalPings++;
                stats.successfulPings++;
            } catch (error) {
                if (!handleCloudflareError(error)) {
                    logError(`Ping failed: ${error.message}`);
                }
                stats.totalPings++;
                stats.failedPings++;
            }
        }, 60000);

        // Set interval untuk status check setiap 2 menit
        setInterval(async () => {
            try {
                const status = await checkNodeStatus();
                stats.todayReward = status.todayReward;
                stats.totalReward = status.totalReward;
                displayStats();
            } catch (error) {
                if (!handleCloudflareError(error)) {
                    logError(`Status check failed: ${error.message}`);
                }
            }
        }, 120000);

        // Set interval untuk session refresh setiap 5 menit
        setInterval(async () => {
            try {
                await startSession();
                stats.sessionRefreshes++;
                logSuccess(`Session refreshed successfully`);
            } catch (error) {
                if (!handleCloudflareError(error)) {
                    logError(`Session refresh failed: ${error.message}`);
                }
            }
        }, 300000);

    } catch (error) {
        if (!handleCloudflareError(error)) {
            logError(`Critical error: ${error.message}`);
        }
        logWarning(`Restarting bot in 5 seconds...`);
        setTimeout(() => runAll(), 5000);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    logWarning(`Shutting down gracefully...`);
    displayStats();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}`);
    logError(`Reason: ${reason}`);
});

// Start program
runAll();