
/*
ref : https://www.soldev.app/course/intro-to-custom-on-chain-programs 

export type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>;
  programId: PublicKey;
  data?: Buffer;
};

key 구조 
    pubkey - the public key of the account
        계정의 공개키
    isSigner - a boolean representing whether or not the account is a signer on the transaction
        위 공개키가 트랜잭션에 서명자인지 여부를 나타내는 부울
    isWritable - a boolean representing whether or not the account is written to during the transaction's executio
        트랜잭션 실행 중에 계정이 쓰여지는지 여부를 나타내는 부울
*/


/* EXAMPLE PING COUNTER PROGRAM 
    DEVNET ADDR : ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa
    DATA ACCOUNT : Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod
*/

import * as web3 from "@solana/web3.js";
import "dotenv/config"
import { getKeypairFromEnvironment, airdropIfRequired } from "@solana-developers/helpers";

const payer = getKeypairFromEnvironment('SECRET_KEY')
const connection = new web3.Connection(web3.clusterApiUrl('devnet'))

const newBalance = await airdropIfRequired(
  connection,
  payer.publicKey,
  5 * web3.LAMPORTS_PER_SOL,
  3 * web3.LAMPORTS_PER_SOL,
);
console.log(`The balance of the account at ${payer.publicKey} is ${newBalance/web3.LAMPORTS_PER_SOL} SOL`); 



const PING_PROGRAM_ADDRESS = new web3.PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa')
const PING_PROGRAM_DATA_ADDRESS =  new web3.PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod')

const transaction = new web3.Transaction()
const programId = new web3.PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new web3.PublicKey(PING_PROGRAM_DATA_ADDRESS)

const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: pingProgramDataId,
        isSigner: false,
        isWritable: true
      },
    ],
    programId
  })

  transaction.add(instruction)

const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )
  
console.log(`✅ Transaction completed! Signature is ${signature}`)
console.log(`✅ After Balance Check: ${((await connection.getBalance(payer.publicKey))/web3.LAMPORTS_PER_SOL).toFixed(6)} SOL`)