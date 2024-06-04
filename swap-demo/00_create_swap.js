/**
 * https://github.com/solana-labs/solana-program-library/blob/master/token-swap/js/test/main.test.ts 
 */

import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { TokenSwap, CurveType, OLD_TOKEN_SWAP_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID } from '@solana/spl-token-swap';
import {
      Keypair,
      Connection,
      clusterApiUrl,
      PublicKey,
} from '@solana/web3.js';
import {
      createMint,
      createAccount,
      mintTo,
      TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import {
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
      assert, sleep
} from './99_utils.js'
import bs58 from 'bs58';

const main = async () => {
      console.log('Run test: createTokenSwap (constant price)');
      const constantPrice = new Uint8Array(8);
      constantPrice[0] = 1;
      await createTokenSwap(CurveType.ConstantProduct, undefined, false, false, TOKEN_PROGRAM_ID);
}

async function createTokenSwap(
      curveType,
      curveParameters = undefined,
      skipCreate = true,
      skipMint = true,
      tokenProgramId = TOKEN_PROGRAM_ID,
) {
      const connection = new Connection(clusterApiUrl("devnet"), { commitment: "confirmed", });
      let payer = getKeypairFromEnvironment("SECRET_KEY");
      let owner = getKeypairFromEnvironment("OWNER_SECRET_KEY");
      let tokenSwapAccount

      tokenSwapAccount = Keypair.generate();
      console.log("tokenSwapAccount secret key : ", tokenSwapAccount.secretKey)


      let [authority, bumpSeed] = await PublicKey.findProgramAddress(
            [tokenSwapAccount.publicKey.toBuffer()],
            TOKEN_SWAP_PROGRAM_ID,
      );
      await sleep(100);

      console.log("tokenSwapAccount  : ", tokenSwapAccount.publicKey.toBase58())
      console.log("authority : ", authority)

      let tokenPool
      let tokenAccountPool;
      let feeAccount;


      console.log('creating pool mint');
      const tokenPoolKeyPair = Keypair.generate();
      tokenPool = await createMint(
            connection,
            payer,
            authority,
            null,
            6,
            tokenPoolKeyPair,
            undefined,
            tokenProgramId
      );
      console.log('creating pool account');
      tokenAccountPool = await createAccount(
            connection,
            payer,
            tokenPool,
            owner.publicKey,
            // authority,
            Keypair.generate(),
            undefined,
            tokenProgramId
      );
      console.log('creating fee account');
      const ownerKey = owner.publicKey.toBase58();
      feeAccount = await createAccount(
            connection,
            payer,
            tokenPool,
            new PublicKey(ownerKey),
            // authority,
            Keypair.generate(),
            undefined,
            tokenProgramId
      );


      console.log("tokenPool : ", tokenPool, '\n')
      console.log("tokenAccountPool : ", tokenAccountPool)
      console.log("feeAccount : ", feeAccount)

      let mintA;
      let tokenAccountA;


      console.log('creating token A');
      const mintAKeyPair = Keypair.generate();
      console.log('mintAKeyPair : ', mintAKeyPair);
      mintA = await createMint(
            connection,
            payer,
            owner.publicKey,
            null,
            6,
            mintAKeyPair,
            undefined,
            tokenProgramId,
      );
      console.log('creating token A account');
      tokenAccountA = await createAccount(
            connection,
            payer,
            mintA,
            authority,
            Keypair.generate(),
            undefined,
            tokenProgramId
      );



      console.log('minting token A to swap');
      await mintTo(
            connection,
            payer,
            mintA,
            tokenAccountA,
            owner,
            currentSwapTokenA,
            undefined,
            undefined,
            tokenProgramId
      );

      console.log(`mintA : `, mintA)
      console.log("tokenAccountA : ", tokenAccountA)


      let mintB;
      let tokenAccountB;
      await sleep(500)
      console.log('creating token B');
      const mintBKeyPair = Keypair.generate();
      mintB = await createMint(
            connection,
            payer,
            owner.publicKey,
            null,
            9,
            mintBKeyPair,
            undefined,
            tokenProgramId,
      );
      console.log("mint B keypair : ", mintBKeyPair)
      console.log('creating token B account');
      tokenAccountB = await createAccount(
            connection,
            payer,
            mintB,
            authority,
            Keypair.generate(),
            undefined,
            tokenProgramId
      );


      console.log("mintB : ", mintB)
      console.log("tokenAccountB : ", tokenAccountB)


      sleep(500)
      console.log('minting token B to swap');
      await mintTo(
            connection,
            payer,
            mintB,
            tokenAccountB,
            owner,
            currentSwapTokenB,
            undefined,
            undefined,
            tokenProgramId
      );



      console.log('creating token swap');
      const swapPayer = getKeypairFromEnvironment("SWAP_PAYER_SECRET_KEY");
      console.log("swapPayer : ", swapPayer.publicKey)
      let tokenSwap = await TokenSwap.createTokenSwap(
            connection,
            swapPayer,
            tokenSwapAccount,
            authority,
            tokenAccountA,
            tokenAccountB,
            tokenPool,
            mintA,
            mintB,
            // tokenProgramId,
            // tokenProgramId,
            feeAccount,
            tokenAccountPool,
            TOKEN_SWAP_PROGRAM_ID,
            tokenProgramId,
            TRADING_FEE_NUMERATOR,
            TRADING_FEE_DENOMINATOR,
            OWNER_TRADING_FEE_NUMERATOR,
            OWNER_TRADING_FEE_DENOMINATOR,
            OWNER_WITHDRAW_FEE_NUMERATOR,
            OWNER_WITHDRAW_FEE_DENOMINATOR,
            HOST_FEE_NUMERATOR,
            HOST_FEE_DENOMINATOR,
            curveType,
            curveParameters,
            { skipPreflight: true }
      );


      console.log('loading token swap');
      const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
            connection,
            tokenSwapAccount.publicKey,
            TOKEN_SWAP_PROGRAM_ID,
            swapPayer,
      );
      console.log(fetchedTokenSwap)
}

main()