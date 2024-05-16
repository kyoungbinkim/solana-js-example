/**
 * https://github.com/solana-labs/solana-program-library/blob/master/token-swap/js/test/main.test.ts 
 */

import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { TokenSwap, CurveType, TOKEN_SWAP_PROGRAM_ID, OLD_TOKEN_SWAP_PROGRAM_ID } from '@solana/spl-token-swap';
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
      currentSwapTokenA ,
      currentSwapTokenB ,
      POOL_TOKEN_AMOUNT 
} from './99_utils.js'


export async function depositAllTokenTypes() {
      const connection = new Connection(clusterApiUrl("devnet"));

      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");
      console.log("swapPayer : ", swapPayer.publicKey.toBase58())

      const mintA = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_A_ADDRESS)
      )).address

      const mintB = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS)
      )).address

      const tokenPool = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_POOL_MINT_ADDRESS)
      )).address

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
      const swapTokenA = await getAccount(connection, tokenAccountA);
      const tokenA = (swapTokenA.amount * BigInt(POOL_TOKEN_AMOUNT)) / supply;
      const swapTokenB = await getAccount(connection, tokenAccountB);
      const tokenB = (swapTokenB.amount * BigInt(POOL_TOKEN_AMOUNT)) / supply;

      let tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );
      console.log("tokenSwap : ", tokenSwap)
      console.log("pool mint info : ", poolMintInfo)


      const userTransferAuthority = Keypair.generate();
      console.log('Creating depositor token a account');
      const userAccountA = await createAccount(
            connection,
            payer,
            mintA,
            owner.publicKey,
            Keypair.generate(),
      );
      await mintTo(connection, payer, mintA, userAccountA, owner, tokenA);
      await approve(
            connection,
            payer,
            userAccountA,
            userTransferAuthority.publicKey,
            owner,
            tokenA,
      );
      console.log('Creating depositor token b account');
      const userAccountB = await createAccount(
            connection,
            payer,
            mintB,
            owner.publicKey,
            Keypair.generate(),
      );
      await mintTo(connection, payer, mintB, userAccountB, owner, tokenB);
      await approve(
            connection,
            payer,
            userAccountB,
            userTransferAuthority.publicKey,
            owner,
            tokenB,
      );
      console.log('Creating depositor pool token account');
      const newAccountPool = await createAccount(
            connection,
            payer,
            tokenPool,
            owner.publicKey,
            Keypair.generate(),
      );

      const confirmOptions = {
            skipPreflight: true,
      };

      console.log('Depositing into swap');
      await tokenSwap.depositAllTokenTypes(
            userAccountA,
            userAccountB,
            newAccountPool,
            TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            userTransferAuthority,
            POOL_TOKEN_AMOUNT,
            tokenA,
            tokenB,
            confirmOptions,
      );

      tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );

      let info;
      info = await getAccount(connection, userAccountA);
      assert(info.amount == 0n);
      info = await getAccount(connection, userAccountB);
      assert(info.amount == 0n);
      info = await getAccount(connection, tokenAccountA);
      assert(info.amount == currentSwapTokenA + tokenA);
      currentSwapTokenA += tokenA;
      info = await getAccount(connection, tokenAccountB);
      assert(info.amount == currentSwapTokenB + tokenB);
      currentSwapTokenB += tokenB;
      info = await getAccount(connection, newAccountPool);
      assert(info.amount == POOL_TOKEN_AMOUNT);
}

depositAllTokenTypes()
