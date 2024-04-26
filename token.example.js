import { 
    createMint,
    mintTo, 
    getMint, 
    getOrCreateAssociatedTokenAccount,
    getAccount,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { 
    clusterApiUrl, 
    Connection, 
    Keypair, 
    PublicKey,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const payer = Keypair.generate();
const mintAuthority = Keypair.generate();
const freezeAuthority = Keypair.generate();

const connection = new Connection(
  'http://127.0.0.1:8899',
  'confirmed'
);

const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
);
await connection.confirmTransaction(airdropSignature);


// 이더리움으로 치면 스마트 계약 배포
const mint = await createMint(
  connection,
  payer,
  mintAuthority.publicKey,
  freezeAuthority.publicKey,
  9 // We are using 9 to match the CLI decimal default exactly -> 10^9 이 1 토큰
);

console.log("token account PubKey : ", mint.toBase58(), mint);

let mintInfo = await getMint(
  connection,
  mint
)

console.log("total supply : ", mintInfo.supply);
// 0


// 토큰 계정 생성
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  payer.publicKey
)

console.log("token account address : ", tokenAccount.address.toBase58());
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


mintInfo = await getMint(
  connection,
  mint
)

console.log("total suply : ", mintInfo.supply);
// 100

const tokenAccountInfo = await getAccount(
  connection,
  tokenAccount.address
)

console.log(tokenAccount.address," balance : " ,tokenAccountInfo.amount);
// 100
(async () => {

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

  const tokenAccounts = await connection.getTokenAccountsByOwner(
    payer.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  console.log("Token                                         Balance");
  console.log("------------------------------------------------------------");
  tokenAccounts.value.forEach((tokenAccount) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
  })

})();