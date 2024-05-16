import { Keypair } from "@solana/web3.js";
import  bs58 from 'bs58';

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`✅ Finished!\n`);



import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
const keypairFromEnv = getKeypairFromEnvironment("SECRET_KEY");

console.log("secret key: ", bs58.encode(keypairFromEnv.secretKey))
console.log("public key: ", keypairFromEnv.publicKey.toBase58())
console.log(
  `✅ Finished! We've loaded our secret key securely, using an env file!`
);