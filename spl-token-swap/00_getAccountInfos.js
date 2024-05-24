import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { TokenSwap,TOKEN_SWAP_PROGRAM_ID } from '@solana/spl-token-swap';
import {
      Connection,
      clusterApiUrl,
      PublicKey,
} from '@solana/web3.js';
import {
      getMint,
      getAccount,
      getMinimumBalanceForRentExemptAccount,
      TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { printLog } from "./99_utils.js";
import  bs58 from 'bs58';

accountInfos()

async function accountInfos() {
      const connection = new Connection(clusterApiUrl("devnet"));
      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");
      const tokenPool = (await getMint(
                  connection,
                  new PublicKey(process.env.TOKEN_POOL_MINT_ADDRESS)
            ))
      const tokenAccountPool =await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_POOL_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )
      const feeAccount = await getAccount(
            connection,
            new PublicKey(process.env.FEE_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )

      const mintA = await getMint(
            connection,
            new PublicKey(process.env.TOKEN_A_ADDRESS)
      )
      const tokenAccountA = await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_A_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )

      const mintB = await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS)
      )
      const tokenAccountB = await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_B_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )

      const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );

      printLog(payer, 'payer')
      printLog(bs58.encode(owner.secretKey), 'owner secrect key')
      printLog(owner.publicKey.toBase58(), "owner pubkey")
      printLog(bs58.encode(swapPayer.secretKey), 'swapPayer secrect key')
      printLog(swapPayer.publicKey.toBase58(), "swapPayer pubkey")
      printLog(tokenSwapAccount, 'tokenSwapAccount')
      printLog(tokenPool, 'tokenPool')
      printLog(tokenAccountPool,'tokenAccountPool'),
      printLog(feeAccount, 'feeAccount')
      printLog(mintA, 'mintA')
      printLog(tokenAccountA, 'tokenAccountA')
      printLog(mintB, 'mintB')
      printLog(tokenAccountB, 'tokenAccountB')
      printLog(fetchedTokenSwap, "tokenSwap")
}

