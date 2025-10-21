const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = class FetchClient {
  constructor() {
    this.agent = process.env.HTTP_PROXY
      ? new HttpsProxyAgent(process.env.HTTP_PROXY)
      : undefined;
  }

  request = async (path, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeout || 60000);
    let result;

    try {
      result = await fetch(path, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || null,
        signal: controller.signal,
        agent: this.agent,
      });
    } finally {
      clearTimeout(timeout);
    }
    return result;
  };
};
