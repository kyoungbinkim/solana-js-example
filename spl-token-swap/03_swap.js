/**
 * https://github.com/solana-labs/solana-program-library/blob/master/token-swap/js/test/main.test.ts 
 */

/**
 * 성공한 스왑 : https://explorer.solana.com/tx/4meKHKjmvANY4FZcfFyB5QXWoVdQyvACzAkK2sZBvbCZByfF2SDQ8Gd699ee4fhEBnnhgaocH43d5d2TeeGF1CoF?cluster=devnet 
 */

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
      SWAP_AMOUNT_IN,
      SWAP_AMOUNT_OUT,
      SWAP_FEE,
      HOST_SWAP_FEE,
      OWNER_SWAP_FEE,
      DEFAULT_POOL_TOKEN_AMOUNT,
      POOL_TOKEN_AMOUNT
} from './99_utils.js'

swap(TOKEN_PROGRAM_ID)

export async function swap(
      tokenProgramId=TOKEN_PROGRAM_ID
) {
      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});
      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");

      const mintA = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_A_ADDRESS),
            undefined,
            tokenProgramId
      )).address

      const mintB = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS),
            undefined,
            tokenProgramId
      )).address

      const tokenPool = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_POOL_MINT_ADDRESS),
            undefined,
            tokenProgramId
      )).address


      const tokenAccountA = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_A_ACCOUNT),
            undefined,
            tokenProgramId
      )).address

      const tokenAccountB = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_B_ACCOUNT),
            undefined,
            tokenProgramId
      )).address

      const tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );

      const swaper = swapPayer
      console.log("tokenSwap : ", tokenSwap)
      console.log("swaper : ", swaper.publicKey.toBase58())

      console.log('Creating swap token a account');
      const userAccountA = await createAccount(
            connection,
            payer,
            mintA,
            swaper.publicKey,
            Keypair.generate(),
            undefined,
            tokenProgramId
      );

      await sleep(500);
      console.log("mint to userAccountA"); 
      await mintTo(
            connection,
            payer, 
            mintA, 
            userAccountA, 
            owner, 
            SWAP_AMOUNT_IN,
            undefined,
            undefined,
            tokenProgramId
      );
      
      await sleep(500);
      const userTransferAuthority = Keypair.generate(); 
      await approve(
            connection,
            payer,
            userAccountA,
            userTransferAuthority.publicKey,
            swaper,
            SWAP_AMOUNT_IN,
            undefined,
            undefined,
            tokenProgramId
      );

      console.log("userTransferAuthority : ", userTransferAuthority.publicKey.toBase58())
      console.log("userAccountA : ", userAccountA)

      console.log('Creating swap token b account');
      const userAccountB = await createAccount(
            connection,
            payer,
            mintB,
            swaper.publicKey,
            Keypair.generate(),
            undefined,
            undefined,
            tokenProgramId
      );
      const poolAccount = await createAccount(
            connection,
            payer,
            tokenPool,
            owner.publicKey,
            Keypair.generate(),
            undefined,
            tokenProgramId
      )


      console.log("userAccountB : ", userAccountB)


      const confirmOptions = {
            skipPreflight: true,
      };

      await sleep(1000)
      console.log('======== Swapping ========');
      await tokenSwap.swap(
            userAccountA,
            tokenAccountA,
            tokenAccountB,
            userAccountB,
            // tokenSwap.mintA,
            // tokenSwap.mintB,
            tokenProgramId,
            tokenProgramId,
            tokenProgramId,
            tokenProgramId,
            poolAccount,
            userTransferAuthority,
            SWAP_AMOUNT_IN,
            0n,
            confirmOptions,
      );

      await sleep(500);

      let info;
      info = await getAccount(connection, userAccountA, undefined, tokenProgramId);
      console.log("userAccountA : ",info);

      info = await getAccount(connection, userAccountB, undefined, tokenProgramId);
      console.log("userAccountB : ", info);

      info = await getAccount(connection, tokenAccountA, undefined, tokenProgramId);
      console.log("tokenAccountA : ", info);

      info = await getAccount(connection, tokenAccountB, undefined, tokenProgramId);
      console.log("tokenAccountB : ", info);

      info = await getAccount(connection, poolAccount, undefined, tokenProgramId);
      console.log("poolAccount : ", info);

}