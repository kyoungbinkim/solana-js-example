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
      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});

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
      const mintAInfo = await getMint(connection, mintA);
      const mintBInfo = await getMint(connection, mintB);

      const supply = poolMintInfo.supply;
      const swapTokenA = await getAccount(connection, tokenAccountA);
      const tokenA = swapTokenA.amount 
      const swapTokenB = await getAccount(connection, tokenAccountB);
      const tokenB = swapTokenB.amount 
      console.log("tokenA amount :", tokenA)
      console.log("tokenB amount :", tokenB)
      
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

      await sleep(1000); 
      console.log("userAccountA: ", userAccountA)
      await mintTo(connection, payer, mintA, userAccountA, owner, tokenA+1n);
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
      await sleep(1000)
      await mintTo(connection, payer, mintB, userAccountB, owner, tokenB+1n);
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
      console.log("userAccountA : ", info)
      info = await getAccount(connection, userAccountB);
      console.log("userAccountB : ", info)
      info = await getAccount(connection, newAccountPool);
      console.log("newAccountPool : ", info)
}

depositAllTokenTypes()
