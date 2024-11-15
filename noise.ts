import { PuppeteerLaunchOptions, Browser } from 'puppeteer';

const randomDelay = async (minimumWaitTime: number = 300) => {
    await new Promise((resolve) => setTimeout(resolve, minimumWaitTime + Math.random() * 1000));
}

interface Config {
    bambooUser: string;
    bambooPassword: string;
    proxyHost?: string;
    proxyPort?: string;
    proxyUser?: string;
    proxyPass?: string;
    bambooURL: string;
    startTime: string;
    endTime: string;
}

const getEnvVariable = (key: string): string | undefined => Deno.env.get(key);

const config: Config = {
    bambooUser: getEnvVariable("BAMBOO_USER")!,
    bambooPassword: getEnvVariable("BAMBOO_PASSWORD")!,
    bambooURL: getEnvVariable("BAMBOO_URL")!,
    startTime: getEnvVariable("START_TIME")!,
    endTime: getEnvVariable("END_TIME")!
}

const USE_PROXY = getEnvVariable("USE_PROXY") === 'true';

if (USE_PROXY) {
    config.proxyHost = getEnvVariable("PROXY_HOST");
    config.proxyPort = getEnvVariable("PROXY_PORT");
    config.proxyUser = getEnvVariable("PROXY_USER");
    config.proxyPass = getEnvVariable("PROXY_PASSWORD");
}

const launchOptions: PuppeteerLaunchOptions = { headless: false };

if (USE_PROXY && config.proxyHost && config.proxyPort) {
    launchOptions.args = [
        `--proxy-server=${config.proxyHost}:${config.proxyPort}`,
    ];
}

const interruptedFunc = async (browser: Browser) => {
    console.log("interrupted! Closing browser");
    await browser.close();
    Deno.exit();
}

export { config, launchOptions, randomDelay, interruptedFunc };