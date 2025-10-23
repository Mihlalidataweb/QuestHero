import { createBaseAccountSDK } from '@base-org/account';
import { pay, getPaymentStatus } from '@base-org/account';
import apiClient from './api';

const APP_NAME = import.meta.env.VITE_BASE_APP_NAME || 'QuestClash';
const APP_LOGO_URL = import.meta.env.VITE_BASE_APP_LOGO_URL || '';
const BASE_CHAIN_HEX = import.meta.env.VITE_BASE_CHAIN_ID || '0x2105'; // Base mainnet
const PLATFORM_ADDRESS = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS || '';
const TESTNET = (import.meta.env.VITE_BASE_TESTNET || 'false') === 'true';

const sdk = createBaseAccountSDK({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
});

export async function signInWithBase(): Promise<{ address: string; token: string }> {
  const USE_API = import.meta.env.VITE_USE_API === 'true';
  
  // 1) Fetch server nonce (recommended) - only in API mode
  let nonce: string;
  if (USE_API) {
    try {
      const res = await apiClient.get('/auth/nonce');
      nonce = res.data as string;
    } catch {
      // 2) Fallback: local nonce
      nonce = cryptoRandom();
    }
  } else {
    // In database mode, always use local nonce
    nonce = cryptoRandom();
  }

  const provider = sdk.getProvider();
  const response = await provider.request({
    method: 'wallet_connect',
    params: [
      {
        version: '1',
        capabilities: {
          signInWithEthereum: { nonce, chainId: BASE_CHAIN_HEX },
        },
      },
    ],
  });

  const accounts = (response as any).accounts || response;
  const { address } = (accounts as any)[0];
  const { message, signature } = ((accounts as any)[0] as any).capabilities.signInWithEthereum;

  let token = '';
  
  if (USE_API) {
    // 3) Verify on backend to create a session token (API mode only)
    try {
      const verify = await apiClient.post('/auth/verify', { address, message, signature });
      token = verify.data?.token as string;
    } catch (err) {
      console.warn('Backend verification failed, proceeding with local auth:', err);
      // Generate a local token for consistency
      token = `local_${cryptoRandom()}`;
    }
  } else {
    // In database mode, generate a local token
    token = `local_${cryptoRandom()}`;
  }

  // Persist for consistency
  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ address }));
  }

  return { address, token };
}

export async function payUSDC(params: { amount: string; to?: string }) {
  const recipient = params.to || PLATFORM_ADDRESS;
  if (!recipient) throw new Error('Missing recipient. Set VITE_PLATFORM_WALLET_ADDRESS or pass `to`.');
  const tx = await pay({ amount: params.amount, to: recipient, testnet: TESTNET });
  return tx;
}

export async function paymentStatus(id: string) {
  return getPaymentStatus({ id, testnet: TESTNET });
}

function cryptoRandom() {
  // 32-hex nonce
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}