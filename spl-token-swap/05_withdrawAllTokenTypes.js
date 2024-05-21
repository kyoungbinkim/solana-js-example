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

export async function withdrawAllTokenTypes() {

      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});
      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");

      const tokenAccountA = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_A_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )).address

      const tokenAccountB = (await getAccount(
            connection,
            new PublicKey(process.env.TOKEN_B_ACCOUNT),
            undefined,
            TOKEN_PROGRAM_ID
      )).address

      const poolMintInfo = await getMint(connection, tokenPool);
      const supply = poolMintInfo.supply;
      let swapTokenA = await getAccount(connection, tokenAccountA);
      let swapTokenB = await getAccount(connection, tokenAccountB);
      let feeAmount = 0n;
      if (OWNER_WITHDRAW_FEE_NUMERATOR !== 0n) {
        feeAmount =
          (POOL_TOKEN_AMOUNT * OWNER_WITHDRAW_FEE_NUMERATOR) /
          OWNER_WITHDRAW_FEE_DENOMINATOR;
      }
      const poolTokenAmount = POOL_TOKEN_AMOUNT - feeAmount;
      const tokenA = (swapTokenA.amount * BigInt(poolTokenAmount)) / supply;
      const tokenB = (swapTokenB.amount * BigInt(poolTokenAmount)) / supply;
    
      console.log('Creating withdraw token A account');
      const userAccountA = await createAccount(
        connection,
        payer,
        mintA,
        owner.publicKey,
        Keypair.generate(),
      );
      console.log('Creating withdraw token B account');
      const userAccountB = await createAccount(
        connection,
        payer,
        mintB,
        owner.publicKey,
        Keypair.generate(),
      );
    
      const userTransferAuthority = Keypair.generate();
      console.log('Approving withdrawal from pool account');
      await approve(
        connection,
        payer,
        tokenAccountPool,
        userTransferAuthority.publicKey,
        owner,
        POOL_TOKEN_AMOUNT,
      );
    
      const confirmOptions = {
        skipPreflight: true,
      };
    
      console.log('Withdrawing pool tokens for A and B tokens');
      await tokenSwap.withdrawAllTokenTypes(
        userAccountA,
        userAccountB,
        tokenAccountPool,
        TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        userTransferAuthority,
        POOL_TOKEN_AMOUNT,
        tokenA,
        tokenB,
        confirmOptions,
      );
    
      //const poolMintInfo = await tokenPool.getMintInfo();
      swapTokenA = await getAccount(connection, tokenAccountA);
      swapTokenB = await getAccount(connection, tokenAccountB);
    
      let info = await getAccount(connection, tokenAccountPool);
      assert(info.amount == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT);
      assert(swapTokenA.amount == currentSwapTokenA - tokenA);
      currentSwapTokenA -= tokenA;
      assert(swapTokenB.amount == currentSwapTokenB - tokenB);
      currentSwapTokenB -= tokenB;
      info = await getAccount(connection, userAccountA);
      assert(info.amount == tokenA);
      info = await getAccount(connection, userAccountB);
      assert(info.amount == tokenB);
      info = await getAccount(connection, feeAccount);
      assert(info.amount == feeAmount);
      currentFeeAmount = feeAmount;
    }