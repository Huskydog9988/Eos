import { SocksProxyAgent } from 'socks-proxy-agent';
import axios from 'axios';

// the full socks5 address
const proxyOptions = 'socks5h://tor:9050';
// create the socksAgent for axios
const httpsAgent = new SocksProxyAgent(proxyOptions);
const httpAgent = new SocksProxyAgent(proxyOptions);

// create a new axios instance
/**
 * Customized axios client to use tor proxy
 */
export const axiosClient = axios.create({
    httpAgent,
    httpsAgent,
    timeout: 120000,
    headers: {
        'User-Agent': `DarkSearch/${process.env.npm_package_version} (compatible; DarkSearch/${process.env.npm_package_version}; +http://github.com/HuskyLabs/dark-search)`,
    },
});
