import {
      createMint,
      mintTo,
      getMint,
      getOrCreateAssociatedTokenAccount,
      getAccount
} from '@solana/spl-token';
import {
      clusterApiUrl,
      Connection,
      Keypair,
      LAMPORTS_PER_SOL,
      PublicKey,
} from '@solana/web3.js';
import "dotenv/config"
import { getKeypairFromEnvironment, airdropIfRequired } from "@solana-developers/helpers";

// const payer = Keypair.generate();
const payer = getKeypairFromEnvironment('SECRET_KEY')
const mintAuthority = Keypair.generate();
const freezeAuthority = Keypair.generate();

const connection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed'
);

// 이더리움으로 치면 스마트 계약 배포
const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      9 // We are using 9 to match the CLI decimal default exactly -> 10^9 이 1 토큰
);

console.log("mint : ", mint.toBase58(), mint, '\n');
// AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

// 변수명 변경하기
let tokenProgramInfo = await getMint(
      connection,
      mint
)

console.log("mintInfo : ", tokenProgramInfo);
// 0


// 토큰 계정 생성
const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
)

console.log("tokenAccount.address : ", tokenAccount.address.toBase58());
// 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi


// 토큰 계정에 토큰 발급
await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      100000000000 // because decimals for the mint are set to 9
)


tokenProgramInfo = await getMint(
      connection,
      mint
)

console.log("mintInfo.supply : ", tokenProgramInfo.supply);
// 100

const tokenAccountInfo = await getAccount(
      connection,
      tokenAccount.address
)

console.log("tokenAccountInfo.amount : ", tokenAccountInfo.amount);
// 100


/**
 * 
 * 토큰 발행량 영지식 증명 어떻게 ? 
 * 
 * uniswap ?
 */