// app_raw.js
const axios = require('axios');
const fs = require('fs').promises;

let config;
const API_BASE_URL = "https://gateway-run.bls.dev/api/v1";

async function loadConfig() {
    try {
        const data = await fs.readFile('config.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Error:', error);
        process.exit(1);
    }
}

async function checkNodeStatus() {
    const statusUrl = `${API_BASE_URL}/nodes/${config.nodeId}`;
    const response = await axios.get(statusUrl, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version
        }
    });
    return response.data;
}

async function registerNode() {
    const registerUrl = `${API_BASE_URL}/nodes/${config.nodeId}`;
    const response = await axios.post(registerUrl, {
        hardwareId: config.hardwareId,
        extensionVersion: config.version
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version
        }
    });
    return response.data;
}

async function startSession() {
    const startSessionUrl = `${API_BASE_URL}/nodes/${config.nodeId}/start-session`;
    const response = await axios.post(startSessionUrl, {
        startAt: new Date().toISOString(),
        extensionVersion: config.version
    }, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version
        }
    });
    return response.data;
}

async function pingNode() {
    const pingUrl = `${API_BASE_URL}/nodes/${config.nodeId}/ping`;
    const response = await axios.post(pingUrl, {
        timestamp: new Date().toISOString(),
        version: config.version
    }, {
        headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'X-Extension-Version': config.version
        }
    });
    return response.data;
}

let stats = {
    totalPings: 0,
    successfulPings: 0,
    failedPings: 0,
    startTime: new Date(),
    sessionRefreshes: 0,
    totalReward: 0,
    todayReward: 0
};

async function runAll() {
    try {
        config = await loadConfig();
        console.log('Config:', config);

        const initialStatus = await checkNodeStatus();
        stats.todayReward = initialStatus.todayReward;
        stats.totalReward = initialStatus.totalReward;

        await registerNode();
        await startSession();
        stats.sessionRefreshes++;

        await pingNode();
        stats.totalPings++;
        stats.successfulPings++;

        setInterval(async () => {
            try {
                await pingNode();
                stats.totalPings++;
                stats.successfulPings++;
            } catch (error) {
                console.log('Ping Error Response:', error.response?.data || error);
                stats.totalPings++;
                stats.failedPings++;
            }
        }, 60000);

        setInterval(async () => {
            try {
                const status = await checkNodeStatus();
                stats.todayReward = status.todayReward;
                stats.totalReward = status.totalReward;
            } catch (error) {
                console.log('Status Check Error Response:', error.response?.data || error);
            }
        }, 120000);

        setInterval(async () => {
            try {
                await startSession();
                stats.sessionRefreshes++;
            } catch (error) {
                console.log('Session Refresh Error Response:', error.response?.data || error);
            }
        }, 300000);

    } catch (error) {
        console.log('Critical Error Response:', error.response?.data || error);
        console.log('Restarting in 5s...');
        setTimeout(() => runAll(), 5000);
    }
}

process.on('SIGINT', async () => {
    console.log('Stats:', stats);
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection:', reason);
});

runAll();