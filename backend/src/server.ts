import os from 'os';
import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT) || 5000;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📱 Mobile devices can connect at: http://${localIP}:${PORT}/api`);
});
