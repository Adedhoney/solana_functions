import { Keypair, PublicKey } from "@solana/web3.js"
import {
    sendSol,
    sendToken,
    swapTokenToSol,
    swapSolToKen,
} from "./app"
import "./transactionDetails"
import base58 from "bs58"
import dotenv from "dotenv"
dotenv.config()

const secretKey = base58.decode(process.env.SECRET_KEY!)

const wallet = Keypair.fromSecretKey(secretKey)

const toKey = new PublicKey(process.env.TO_PUB_KEY!)

// sendToken(toKey, wallet)
// sendSol(toKey, wallet)
// app.mintNft()
// app.generateNFTCollection()

// swapTokenToSol(wallet)
// swapSolToKen(wallet)
