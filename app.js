// Modifikasi bagian error handling di fungsi runAll()
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
                if (error.response?.status === 403 && error.response?.data?.includes('Cloudflare')) {
                    logError(`IP ADDRESS TERBLOKIR OLEH CLOUDFLARE`);
                    logError(`Ray ID: ${error.response?.data?.match(/Ray ID: (.*?)</)?.[1] || 'Unknown'}`);
                    logError(`Solusi: Gunakan VPN atau tunggu 24 jam`);
                } else {
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
                if (error.response?.status === 403 && error.response?.data?.includes('Cloudflare')) {
                    logError(`IP ADDRESS TERBLOKIR OLEH CLOUDFLARE`);
                    logError(`Ray ID: ${error.response?.data?.match(/Ray ID: (.*?)</)?.[1] || 'Unknown'}`);
                    logError(`Solusi: Gunakan VPN atau tunggu 24 jam`);
                } else {
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
                if (error.response?.status === 403 && error.response?.data?.includes('Cloudflare')) {
                    logError(`IP ADDRESS TERBLOKIR OLEH CLOUDFLARE`);
                    logError(`Ray ID: ${error.response?.data?.match(/Ray ID: (.*?)</)?.[1] || 'Unknown'}`);
                    logError(`Solusi: Gunakan VPN atau tunggu 24 jam`);
                } else {
                    logError(`Session refresh failed: ${error.message}`);
                }
            }
        }, 300000);

    } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.includes('Cloudflare')) {
            logError(`IP ADDRESS TERBLOKIR OLEH CLOUDFLARE`);
            logError(`Ray ID: ${error.response?.data?.match(/Ray ID: (.*?)</)?.[1] || 'Unknown'}`);
            logError(`Solusi: Gunakan VPN atau tunggu 24 jam`);
        } else {
            logError(`Critical error: ${error.message}`);
        }
        logWarning(`Restarting bot in 5 seconds...`);
        setTimeout(() => runAll(), 5000);
    }
}