import * as solana from "@solana/web3.js"
import { createWallet } from "./transactions/wallet"
import bs58 from "bs58"
import * as sole from "../solanaHelper"
import dotenv from "dotenv"
dotenv.config()
console.log("gets here")
// const { HTTP_LINK, WSS_LINK } = process.env

const sender = "private key"
const reciever = "public key"

const tokenToSend = "token address"

;(async () => {
    const result = await sole.sendSplTokenWithBase58(
        sender,
        reciever,
        1000000000,
        tokenToSend
    )
    console.log(result)
})()
// ;(async () => {
//     const result = await sole.sendSolTransactionWithBase58(
//         sender,
//         reciever,
//         0.1
//     )
//     console.log(result)
// })()

const testTransaction = async () => {
    // console.log(bs58.encode(wallet.secretKey))
    // await requestAirdrop(connection, wallet.publicKey)
    // await mintToken(connection, wallet)
    // let balance = await connection.getBalance(wallet.publicKey)
    // console.log(balance / solana.LAMPORTS_PER_SOL)
    // const wallet = await createWallet(connection)
    // console.log(HTTP_LINK)
    // mint(connection, wallet, HTTP_LINK ? HTTP_LINK : "")
    // generateCandyMachine(connection, wallet, HTTP_LINK ? HTTP_LINK : "")
    //
}
