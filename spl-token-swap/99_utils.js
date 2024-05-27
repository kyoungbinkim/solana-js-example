import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function newAccountWithLamports(
      connection,
      lamports = 1000000,
) {
      const account = Keypair.generate();

      let retries = 30;
      await connection.requestAirdrop(account.publicKey, lamports);
      for (; ;) {
            await sleep(500);
            if (lamports == (await connection.getBalance(account.publicKey))) {
                  return account;
            }
            if (--retries <= 0) {
                  break;
            }
      }
      throw new Error(`Airdrop of ${lamports} failed`);
}

export function assert(condition, message) {
      if (!condition) {
            console.log(Error().stack + ':token-test.js');
            throw message || 'Assertion failed';
      }
}


export async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
}

export function printLog(data, desc) {
      console.log(`========== ${desc} ==========`)
      console.log(data)
      console.log(`=============================\n`)
}

export const mintAProgramId = TOKEN_PROGRAM_ID;
export const mintBProgramId = TOKEN_PROGRAM_ID;

// Hard-coded fee address, for testing production mode
export const SWAP_PROGRAM_OWNER_FEE_ADDRESS = process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;
console.log("SWAP_PROGRAM_OWNER_FEE_ADDRESS : ", SWAP_PROGRAM_OWNER_FEE_ADDRESS)
// Pool fees
export const TRADING_FEE_NUMERATOR = 0n;
export const TRADING_FEE_DENOMINATOR = 1_000_000n;

// 문제 ...
export const OWNER_TRADING_FEE_NUMERATOR = 0n;
export const OWNER_TRADING_FEE_DENOMINATOR = 1_000_000n;

export const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0n : 1n;
export const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0n : 6n;
export const HOST_FEE_NUMERATOR = 0n;
export const HOST_FEE_DENOMINATOR = 100n;

// Initial amount in each swap token
export let currentSwapTokenA = 10_000_000n;
export let currentSwapTokenB = 10_000_000n;
export let currentFeeAmount = 0n;

// Swap instruction constants
// Because there is no withdraw fee in the production version, these numbers
// need to get slightly tweaked in the two cases.
export const SWAP_AMOUNT_IN = 1_000_000n;
export const SWAP_AMOUNT_OUT = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 90661n : 90674n;
export const SWAP_FEE = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 22727n : 22730n;
export const HOST_SWAP_FEE = SWAP_PROGRAM_OWNER_FEE_ADDRESS
      ? (SWAP_FEE * HOST_FEE_NUMERATOR) / HOST_FEE_DENOMINATOR
      : 0n;
export const OWNER_SWAP_FEE = SWAP_FEE - HOST_SWAP_FEE;

// Pool token amount minted on init
export const DEFAULT_POOL_TOKEN_AMOUNT = 1000000000n;
// Pool token amount to withdraw / deposit
export const POOL_TOKEN_AMOUNT = 10000000n;

