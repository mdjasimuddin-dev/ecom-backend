import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export const getClientInfo = (req: Request) => {
  const userAgent = req.headers['user-agent'] || '';

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    ipAddress: req.ip || 'Unknown',

    device: result.device.type || 'Desktop',
    deviceModel: result.device.model || 'Unknown',
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || 'Unknown',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || 'Unknown',

    userAgent,
  };
};
