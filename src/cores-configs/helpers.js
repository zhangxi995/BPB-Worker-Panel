import { resolveDNS, isDomain } from '../helpers/helpers';

//export async function getConfigAddresses(cleanIPs, enableIPv6) {
//    const resolved = await resolveDNS(globalThis.hostName);
//    const defaultIPv6 = enableIPv6 ? resolved.ipv6.map((ip) => `[${ip}]`) : []
//    return [
//        globalThis.hostName,
//        'www.speedtest.net',
//        ...resolved.ipv4,
//        ...defaultIPv6,
//        ...(cleanIPs ? cleanIPs.split(',') : [])
//    ];
//}

export async function getConfigAddresses(cleanIPs, enableIPv6) {
    const resolved = await resolveDNS(globalThis.hostName);
    const defaultIPv6 = enableIPv6 ? resolved.ipv6.map((ip) => `[${ip}]`) : [];

    // 如果 cleanIPs 是 URL，需要先下载内容
    let ipList = [];
    if (cleanIPs && cleanIPs.startsWith('http')) {
        try {
            const response = await fetch(cleanIPs);
            if (response.ok) {
                const data = await response.text();
                // 处理逗号或换行符分隔的 IP 列表，去掉冒号及其后内容，过滤空行和空白字符
                ipList = data
                    .split(/[\n,]/)                // 按换行或逗号分隔
                    .map(ip => ip.split(':')[0])   // 去掉冒号及其后内容
                    .map(ip => ip.trim())          // 去掉首尾空格
                    .filter(ip => ip);             // 过滤空值和空行
            } else {
                console.error('Failed to fetch IP list from URL:', cleanIPs);
            }
        } catch (error) {
            console.error('Error fetching IP list:', error);
        }
    } else {
        // 直接处理传入的 IP 列表，支持逗号或换行符
        ipList = cleanIPs
            ? cleanIPs
                .split(/[\n,]/)               // 按换行或逗号分隔
                .map(ip => ip.split(':')[0])  // 去掉冒号及其后内容
                .map(ip => ip.trim())         // 去掉首尾空格
                .filter(ip => ip)             // 过滤空值和空行
            : [];
    }

    // 返回拼接后的完整地址列表
    return [
        'cf.090227.xyz',
        'speed.marisalnc.com',
        'shopify.com',
        ...resolved.ipv4,
        ...defaultIPv6,
        ...ipList
    ];
}


export function extractWireguardParams(warpConfigs, isWoW) {
    const index = isWoW ? 1 : 0;
    const warpConfig = warpConfigs[index].account.config;
    return {
        warpIPv6: `${warpConfig.interface.addresses.v6}/128`,
        reserved: warpConfig.client_id,
        publicKey: warpConfig.peers[0].public_key,
        privateKey: warpConfigs[index].privateKey,
    };
}

export function generateRemark(index, port, address, cleanIPs, protocol, configType) {
    let addressType;
    const type = configType ? ` ${configType}` : '';

    cleanIPs.includes(address)
        ? addressType = 'Clean IP'
        : addressType = isDomain(address) ? 'Domain': isIPv4(address) ? 'IPv4' : isIPv6(address) ? 'IPv6' : '';

    return `💦 ${index} - ${protocol}${type} - ${addressType} : ${port}`;
}

export function randomUpperCase (str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += Math.random() < 0.5 ? str[i].toUpperCase() : str[i];
    }
    return result;
}

export function getRandomPath (length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function base64ToDecimal (base64) {
    const binaryString = atob(base64);
    const hexString = Array.from(binaryString).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const decimalArray = hexString.match(/.{2}/g).map(hex => parseInt(hex, 16));
    return decimalArray;
}

export function isIPv4(address) {
    const ipv4Pattern = /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    return ipv4Pattern.test(address);
}

export function isIPv6(address) {
    const ipv6Pattern = /^\[(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|::(?:[a-fA-F0-9]{1,4}:){0,7}|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6})\](?:\/(1[0-1][0-9]|12[0-8]|[0-9]?[0-9]))?$/;
    return ipv6Pattern.test(address);
}