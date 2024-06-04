import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { TokenSwap, CurveType, TOKEN_SWAP_PROGRAM_ID } from '@solana/spl-token-swap';
import {
      Connection,
      clusterApiUrl,
      PublicKey,
} from '@solana/web3.js';
import {
      getAccount,
      TOKEN_PROGRAM_ID,
} from '@solana/spl-token';



const swapInfo = async () => {
      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});

      const tokenAccountUSDT = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_A_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      ))

      const tokenAccountLHA = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_B_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      ))

      const swaper = getKeypairFromEnvironment("SECRET_KEY");
      const tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY").publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swaper,
      );

      console.log("tokenAccountUSDT : ", tokenAccountUSDT)
      console.log("tokenAccountLHA : ", tokenAccountLHA)
      console.log("tokenSwap : ", tokenSwap)
}
swapInfo()