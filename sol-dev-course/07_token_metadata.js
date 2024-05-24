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
} from '@solana/web3.js';
import { getKeypairFromEnvironment, airdropIfRequired } from "@solana-developers/helpers";
import { splDiscriminate } from '@solana/spl-type-length-value';
import { createMint } from '@solana/spl-token';


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

    const metaData = {
        updateAuthority: updateAuthority.publicKey,
        mint: mint,
        name: "Kim-Kyoung-Bin",
        symbol: "KBIN",
        uri: "",
        additionalMetadata: [["description", "TEST METADATA"]],
    };

    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;

    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen,
    );
    console.log(lamports)

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction =
        createInitializeMetadataPointerInstruction(
            mint, // Mint Account address
            updateAuthority, // Authority that can set the metadata address
            mint, // Account address that holds the metadata
            TOKEN_PROGRAM_ID,
        );

    const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority.publicKey, // Authority that can update the metadata
        mint: mint, // Mint Account address
        mintAuthority: mintAuthority, // Designated Mint Authority
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
    });

    // Instruction to update metadata, adding custom field
    const updateFieldInstruction = createUpdateFieldInstruction({
        programId: TOKEN_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        field: metaData.additionalMetadata[0][0], // key
        value: metaData.additionalMetadata[0][1], // value
    });

    // Add instructions to new transaction
    transaction = new Transaction().add(
        initializeMetadataPointerInstruction,
        initializeMetadataInstruction,
        updateFieldInstruction,
    );

    // Send transaction
    transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, mintKeypair], // Signers
    );

    console.log(
        "\nCreate Mint Account:",
        `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );
}
createTokenMetaData()