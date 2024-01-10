import * as solana from "@solana/web3.js"
import { createWallet } from "./wallet"
import bs58 from "bs58"
import {
    sendTrasaction,
    requestAirdrop,
    mintToken,
    sendSplToken,
} from "./transactions"
import db from "./db/db"

const testTransaction = async () => {
    // const connection = new solana.Connection(
    //     "https://nd-666-486-702.p2pify.com/a152a989afaaff2af9bcf29bfef11523",
    //     {
    //         wsEndpoint:
    //             "wss://ws-nd-666-486-702.p2pify.com/a152a989afaaff2af9bcf29bfef11523",
    //     }
    // )
    // Use connection below for minting and airdrop
    const connection = new solana.Connection(solana.clusterApiUrl("devnet"), {
        commitment: "confirmed",
    })
    let publicKey = db.wallets.get("wallets").value()[1].Keypair
    const Keypair = db.wallets.get("wallets").value()[1].Keypair

    let secretKey = Object.values(Keypair.secretKey)
    const uintSecretKey = new Uint8Array(secretKey)
    const wallet = solana.Keypair.fromSecretKey(uintSecretKey)
    // console.log(bs58.encode(wallet.secretKey))
    // await requestAirdrop(connection, wallet.publicKey)
    // await mintToken(connection, wallet)

    // let balance = await connection.getBalance(wallet.publicKey)
    // console.log(balance / solana.LAMPORTS_PER_SOL)

    // const wallet = await createWallet(connection)

    // await sendTrasaction(connection, wallet, publicKey.publicKey, 0.5)
}

testTransaction()