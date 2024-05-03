import "dotenv/config"
import { 
    SystemProgram, 
    Connection, 
    clusterApiUrl, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    PublicKey, 
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');

// 보낼 사람
const sender = getKeypairFromEnvironment("SECRET_KEY");

// 받을 사람
const receiver = Keypair.generate()

// 잔고 확인
let senderBal = await connection.getBalance(sender.publicKey);
let receiverBal = await connection.getBalance(receiver.publicKey);
console.log(`before Balance Check:`)
console.log(`The balance of the account at ${sender.publicKey} is ${senderBal/LAMPORTS_PER_SOL} SOL`); 
console.log(`The balance of the account at ${receiver.publicKey} is ${receiverBal/LAMPORTS_PER_SOL} SOL`); 


const transaction = new Transaction()
const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: receiver.publicKey,
  lamports: LAMPORTS_PER_SOL/1000 // 0.001 sol
})

transaction.add(sendSolInstruction)

const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender]
)

// check at : https://explorer.solana.com/?cluster=devnet
console.log(`\nTransaction Signature: ${signature}`)

// await (async function() {
//     const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
//     await sleep(3000)
// })()


senderBal = await connection.getBalance(sender.publicKey);
receiverBal = await connection.getBalance(receiver.publicKey);

console.log(`\nAfter Balance Check:`)
console.log(`Sender balance of the account at ${sender.publicKey} is ${senderBal/LAMPORTS_PER_SOL} SOL`); 
console.log(`Receiver balance of the account at ${receiver.publicKey} is ${receiverBal/LAMPORTS_PER_SOL} SOL`); 
