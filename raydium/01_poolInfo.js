import {
  LIQUIDITY_STATE_LAYOUT_V4,
  MARKET_STATE_LAYOUT_V3,
  DEVNET_PROGRAM_ID,
  MAINNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import {
  Connection,
  PublicKey,
  GetProgramAccountsConfig,
} from "@solana/web3.js";

// Define a function to fetch and decode OpenBook accounts
async function fetchOpenBookAccounts(
  connection,
  baseMint,
  quoteMint,
  commitment
) {
  const accounts = await connection.getProgramAccounts(
    // networkData.openbookProgramId,
    // MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
    {
      commitment,
      filters: [
        { dataSize: MARKET_STATE_LAYOUT_V3.span },
        {
          memcmp: {
            offset: MARKET_STATE_LAYOUT_V3.offsetOf("baseMint"),
            bytes: baseMint.toBase58(),
          },
        },
        {
          memcmp: {
            offset: MARKET_STATE_LAYOUT_V3.offsetOf("quoteMint"),
            bytes: quoteMint.toBase58(),
          },
        },
      ],
    }
  );

  return accounts.map(({ account }) =>
    MARKET_STATE_LAYOUT_V3.decode(account.data)
  );
}

// Define a function to fetch and decode Market accounts
async function fetchMarketAccounts(
  connection,
  baseMint,
  quoteMint,
  commitment
) {
  const accounts = await connection.getProgramAccounts(
    // networkData.marketProgramId,
    // MAINNET_PROGRAM_ID.AmmV4,
    DEVNET_PROGRAM_ID.AmmV4,
    {
      commitment,
      filters: [
        { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
        {
          memcmp: {
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
            bytes: baseMint.toBase58(),
          },
        },
        {
          memcmp: {
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
            bytes: quoteMint.toBase58(),
          },
        },
      ],
    }
  );

  return accounts.map(({ pubkey, account }) => ({
    id: pubkey.toString(),
    ...LIQUIDITY_STATE_LAYOUT_V4.decode(account.data),
  }));
}

async function main() {
  const SOLANA_CONNECTION = new Connection(
    // you rpc url here,
    "confirmed"
  );

  // Slerf
  //   const baseMint = new PublicKey(
  //     "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"
  //   );

  // DEVNET - BASE/ATX
  const baseMint = new PublicKey(
    "3zL6LK3z5oj2iDK8HQ7XDGqYY7XrPHeVFKC6gaEUSuqn"
  );
  const quoteMint = new PublicKey(
    "AF5pQJq6F5u2gq5durDS6ZgKU3DCoCYKZNzvHHyXPGBp"
  );

  //   let openBookAccounts = await fetchOpenBookAccounts(
  //     SOLANA_CONNECTION,
  //     baseMint,
  //     quoteMint,
  //     "confirmed"
  //   );

  //   console.log(openBookAccounts);
  //   console.log(`Number of OpenBook accounts: ${openBookAccounts.length}`);

  let marketAccounts = await fetchMarketAccounts(
    SOLANA_CONNECTION,
    baseMint,
    quoteMint,
    "confirmed"
  );

  console.log(marketAccounts);
  console.log(`poolOpenTime: ${marketAccounts[0].poolOpenTime}`);
  console.log(`Number of market accounts: ${marketAccounts.length}`);
}

main();