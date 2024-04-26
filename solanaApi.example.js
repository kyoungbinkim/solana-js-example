import  web3 from "@solana/web3.js"
import nacl from "tweetnacl"


/**
 *  sol  전송 예시 코드
 */


// localnet : 'http://127.0.0.1:8899'
// devnet : web3.clusterApiUrl("devnet")
let connection = new web3.Connection('http://127.0.0.1:8899', "confirmed");
 
let slot = await connection.getSlot();
console.log(slot);
// 93186439
 
let blockTime = await connection.getBlockTime(slot);
console.log(blockTime);
// 1630747045
 
let block = await connection.getBlock(slot);
console.log(block);
 
/*
{
    blockHeight: null,
    blockTime: 1630747045,
    blockhash: 'AsFv1aV5DGip9YJHHqVjrGg6EKk55xuyxn2HeiN9xQyn',
    parentSlot: 93186438,
    previousBlockhash: '11111111111111111111111111111111',
    rewards: [],
    transactions: []
}
*/
 
let slotLeader = await connection.getSlotLeader();
console.log(slotLeader);
//49AqLYbpJYc2DrzGUAH1fhWJy62yxBxpLEkfJwjKy2jr


let payer = web3.Keypair.generate();
let toAccount = web3.Keypair.generate();

let airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    web3.LAMPORTS_PER_SOL * 100,
);
   
await connection.confirmTransaction({ signature: airdropSignature });
   
airdropSignature = await connection.requestAirdrop(
    toAccount.publicKey,
    web3.LAMPORTS_PER_SOL * 100,
);
   
await connection.confirmTransaction({ signature: airdropSignature });


  // Create Simple Transaction
let transaction = new web3.Transaction();

// Add an instruction to execute
transaction.add(
    web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount.publicKey,
      lamports: 1000,
    }),
  );
   
  // Send and confirm transaction
  // Note: feePayer is by default the first signer, or payer, if the parameter is not set
  await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
   
  // Alternatively, manually construct the transaction
  let recentBlockhash = await connection.getRecentBlockhash();
  let manualTransaction = new web3.Transaction({
    recentBlockhash: recentBlockhash.blockhash,
    feePayer: payer.publicKey,
  });


  manualTransaction.add(
    web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount.publicKey,
      lamports: 1000,
    }),
  );
   
  let transactionBuffer = manualTransaction.serializeMessage();
  let signature = nacl.sign.detached(transactionBuffer, payer.secretKey);
   
  manualTransaction.addSignature(payer.publicKey, signature);
   
  let isVerifiedSignature = manualTransaction.verifySignatures();
  console.log(`The signatures were verified: ${isVerifiedSignature}`);
   
  // The signatures were verified: true
   
  let rawTransaction = manualTransaction.serialize();

  await web3.sendAndConfirmRawTransaction(connection, rawTransaction);

