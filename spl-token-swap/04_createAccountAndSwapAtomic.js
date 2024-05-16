/**
 * https://github.com/solana-labs/solana-program-library/blob/master/token-swap/js/test/main.test.ts 
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
} from '@solana/spl-token';
import { assert, sleep } from "./99_utils.js";
import {
      SWAP_AMOUNT_IN,
      mintAProgramId,
      mintBProgramId
} from './99_utils.js'


createAccountAndSwapAtomic()

async function createAccountAndSwapAtomic() {
      const connection = new Connection(clusterApiUrl("devnet"));
      const payer = getKeypairFromEnvironment("SECRET_KEY");
      const owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      const tokenSwapAccount = getKeypairFromEnvironment("TOKEN_SWAP_ACCOUNT_SECRET_KEY");
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");

      const mintA = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_A_ADDRESS)
      )).address
      const mintB = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS)
      )).address

      const tokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );

      console.log('Creating swap token a account');
      const userAccountA = await createAccount(
            connection,
            payer,
            mintA,
            owner.publicKey,
            Keypair.generate(),
      );
      await mintTo(connection, payer, mintA, userAccountA, owner, SWAP_AMOUNT_IN);
      sleep(500)

      // @ts-ignore
      const balanceNeeded = await getMinimumBalanceForRentExemptAccount(connection);
      const newAccount = Keypair.generate();
      const transaction = new Transaction();
      transaction.add(
            SystemProgram.createAccount({
                  fromPubkey: owner.publicKey,
                  newAccountPubkey: newAccount.publicKey,
                  lamports: balanceNeeded,
                  space: AccountLayout.span,
                  programId: mintBProgramId,
            }),
      );

      transaction.add(
            createInitializeAccountInstruction(
                  newAccount.publicKey,
                  mintB,
                  owner.publicKey,
                  mintBProgramId,
            ),
      );

      const userTransferAuthority = Keypair.generate();
      transaction.add(
            createApproveInstruction(
                  userAccountA,
                  userTransferAuthority.publicKey,
                  owner.publicKey,
                  SWAP_AMOUNT_IN,
                  [],
                  mintAProgramId,
            ),
      );

      transaction.add(
            TokenSwap.swapInstruction(
                  tokenSwap.tokenSwap,
                  tokenSwap.authority,
                  userTransferAuthority.publicKey,
                  userAccountA,
                  tokenSwap.tokenAccountA,
                  tokenSwap.tokenAccountB,
                  newAccount.publicKey,
                  tokenSwap.poolToken,
                  tokenSwap.feeAccount,
                  null,
                  tokenSwap.mintA,
                  tokenSwap.mintB,
                  tokenSwap.swapProgramId,
                  TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  tokenSwap.poolTokenProgramId,
                  SWAP_AMOUNT_IN,
                  0n,
            ),
      );

      const confirmOptions = {
            skipPreflight: true,
      };

      // Send the instructions
      console.log('sending big instruction');
      await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, owner, newAccount, userTransferAuthority],
            confirmOptions,
      );

      let info;
      info = await getAccount(connection, tokenAccountA);
      currentSwapTokenA = info.amount;
      info = await getAccount(connection, tokenAccountB);
      currentSwapTokenB = info.amount;
}