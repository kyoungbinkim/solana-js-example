import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// devnet 네워크에 연결
const connection = new Connection(clusterApiUrl("devnet"));
console.log(`✅ Connected!`)

/**
 * The secret key is:  Uint8Array(64) [
  237, 189, 124,  51, 131,  96, 213, 208,  13, 108, 184,
  121,  21, 243, 184, 123,  40,  87, 125, 122, 168, 251,
  218, 181,  16, 244,  18,  31, 251, 155, 139, 152,  43,
   39, 169, 159,  10,  86, 245,  47, 159, 236,  36, 202,
  225, 160,  71, 230, 184, 132, 171, 141, 207, 108, 202,
  106,  88,  41, 154, 132, 130,  73,  21, 175
]
 */
const address = new PublicKey('3uTcJyrzTojuZ9M5mrJfa4YhxMDmAQzx4pjEkB68D86a')
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;


console.log(`The balance of the account at ${address} is ${balance} lamports`); 
console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`); 
console.log(`✅ Finished!`)


