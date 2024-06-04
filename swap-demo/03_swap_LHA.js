import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { TokenSwap, CurveType, TOKEN_SWAP_PROGRAM_ID } from '@solana/spl-token-swap';
import {
      Keypair,
      Connection,
      clusterApiUrl,
      PublicKey,
      SystemProgram,
      Transaction,
      sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
      approve,
      createMint,
      createAccount,
      createApproveInstruction,
      createInitializeAccountInstruction,
      getMint,
      getAccount,
      getMinimumBalanceForRentExemptAccount,
      getOrCreateAssociatedTokenAccount,
      mintTo,
      AccountLayout,
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { assert, sleep } from "./99_utils.js";
import {
      SWAP_PROGRAM_OWNER_FEE_ADDRESS,
      TRADING_FEE_NUMERATOR,
      TRADING_FEE_DENOMINATOR,
      OWNER_TRADING_FEE_NUMERATOR,
      OWNER_TRADING_FEE_DENOMINATOR,
      OWNER_WITHDRAW_FEE_NUMERATOR,
      OWNER_WITHDRAW_FEE_DENOMINATOR,
      HOST_FEE_NUMERATOR,
      HOST_FEE_DENOMINATOR,
      currentSwapTokenA,
      currentSwapTokenB,
      currentFeeAmount,
      LHA_SWAP_AMOUNT_IN,
      SWAP_AMOUNT_OUT,
      SWAP_FEE,
      HOST_SWAP_FEE,
      OWNER_SWAP_FEE,
      DEFAULT_POOL_TOKEN_AMOUNT,
      POOL_TOKEN_AMOUNT
} from './99_utils.js'

const swapLHA = async () => {
      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});

      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");

      const mintLHA = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS),
      )).address

      const tokenAccountLHA = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_B_ACCOUNT),
      )).address

      const userAccountLHA =  (await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintLHA,
            payer.publicKey,
      )).address;


      const mintUSDT = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_A_ADDRESS),
      )).address

      const tokenAccountUSDT = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_A_ACCOUNT)
      )).address

      const userAccountUSDT = (await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintUSDT,
            payer.publicKey
      )).address
      

      const userTransferAuthority = Keypair.generate(); 
      await approve(
            connection,
            payer,
            userAccountLHA,
            userTransferAuthority.publicKey,
            payer,
            BigInt(1e9), // 1 LHA
      );

      const tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            payer,
      );

      await tokenSwap.swap(
            userAccountLHA,
            tokenAccountLHA,
            tokenAccountUSDT,
            userAccountUSDT,
            TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            null,
            userTransferAuthority,
            BigInt(1e9), // 1 LHA
            0n,
      );
}     
swapLHA()