import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
      Connection,
      clusterApiUrl,
      PublicKey,
} from '@solana/web3.js';
import {
      getMint,
      getOrCreateAssociatedTokenAccount,
      mintTo,
      TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const mintLHA = async () => {
      const connection = new Connection(clusterApiUrl("devnet"), {commitment: "confirmed",});

      const payer = getKeypairFromEnvironment("SECRET_KEY");

      const mintLHA = (await getMint(
            connection,
            new PublicKey(process.env.TOKEN_B_ADDRESS),
            undefined,
            TOKEN_PROGRAM_ID
      )).address

      const userAccountLHA =  (await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintLHA,
            payer.publicKey,
      )).address;

      await mintTo(
            connection,
            payer, 
            mintLHA, 
            userAccountLHA, 
            getKeypairFromEnvironment("OWNER_SECRET_KEY"), 
            BigInt(1e9),
      );
}
mintLHA()