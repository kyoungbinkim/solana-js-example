import "dotenv/config"
import {
  createEmitInstruction,
  createInitializeInstruction,
  createRemoveKeyInstruction,
  createUpdateAuthorityInstruction,
  createUpdateFieldInstruction,
  getFieldCodec,
  getFieldConfig,
  pack,
  unpack,
} from '@solana/spl-token-metadata';
import {
  // addDecoderSizePrefix,
  // fixDecoderSize,
  getBooleanDecoder,
  getBytesDecoder,
  getDataEnumCodec,
  getOptionDecoder,
  getUtf8Decoder,
  getU32Decoder,
  getU64Decoder,
  getStructDecoder,
  some,
} from '@solana/codecs';
import {
  TOKEN_PROGRAM_ID,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  getMint,
  getMetadataPointerState,
  getTokenMetadata,
  TYPE_SIZE,
  LENGTH_SIZE,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { getKeypairFromEnvironment, airdropIfRequired } from "@solana-developers/helpers";
import { splDiscriminate } from '@solana/spl-type-length-value';
import { createMint } from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';


const getRandomInt = (min, max) => { return Math.floor(Math.random() * (max - min)) + min; }

const createTokenMetaData = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), { commitment: "confirmed", });
  const payer = getKeypairFromEnvironment('SECRET_KEY');
  const mintAuthority = payer;
  const updateAuthority = payer;
  
  const decimal = 9
  const mintKeypair = Keypair.generate();
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    decimal, // We are using 9 to match the CLI decimal default exactly -> 10^9 이 1 토큰
    mintKeypair
  );
  console.log("mint : ", mint.toBase58())

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  )
  console.log("tokenAccount : ", tokenAccount.address.toBase58())

  const randInt = getRandomInt(0, 1000)
  const metaData = {
    updateAuthority: updateAuthority.publicKey,
    mint: mint,
    tokenName: "KKB-" + randInt.toString()+'-',
    symbol: "K" + randInt.toString() +'B',
    uri: "https://raw.githubusercontent.com/kyoungbinkim/solana-js-example/main/sol-dev-course/metadata/testMetaData.json",
    additionalMetadata: [["description", "TEST METADATA"]],
  };
  
  const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        PROGRAM_ID,
      )[0],
      mint: mintKeypair.publicKey,
      mintAuthority: mintAuthority.publicKey,
      payer: payer.publicKey,
      updateAuthority: updateAuthority.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: metaData.tokenName,
          symbol: metaData.symbol,
          uri: metaData.uri,
          creators: null,
          sellerFeeBasisPoints: 0,
          uses: null,
          collection: null,
        },
        isMutable: false,
        collectionDetails: null,
      },
    },
  );

  const createNewTokenTransaction = new Transaction().add(
    createMetadataInstruction
  )

  const transactionSign = await sendAndConfirmTransaction(connection, createNewTokenTransaction, [mintAuthority, payer]);
  console.log("transactionSign : ", transactionSign)
}

createTokenMetaData()