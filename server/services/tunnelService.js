import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tunnelFile = path.resolve(__dirname, '../tunnel_url.txt');

export const getPublicTunnelUrl = () => {
  if (process.env.PUBLIC_TUNNEL_URL) {
    return process.env.PUBLIC_TUNNEL_URL.trim();
  }
  if (fs.existsSync(tunnelFile)) {
    const content = fs.readFileSync(tunnelFile, 'utf8').trim();
    if (content.startsWith('https://')) {
      return content;
    }
  }
  return null;
};
