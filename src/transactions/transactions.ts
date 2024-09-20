import {
    SystemProgram,
    Connection,
    ParsedAccountData,
    Keypair,
    PublicKey,
    Transaction,
    LAMPORTS_PER_SOL,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js"
import { sendBundle } from "./Bundle"
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher"

const blockEngineUrl = process.env.BLOCK_ENGINE_URL || ""

// Function to send sol from one account to another
const sendSolTrasaction = async (
    connection: Connection,
    fromKeyPair: Keypair,
    toKey: PublicKey,
    numOfSol: number
) => {
    const transfer = SystemProgram.transfer({
        fromPubkey: fromKeyPair.publicKey,
        toPubkey: toKey,
        lamports: numOfSol * LAMPORTS_PER_SOL,
    })
    console.log(fromKeyPair.publicKey.toString())

    const blockHash = (
        await connection.getLatestBlockhash("confirmed")
    ).blockhash

    const messageV0 = new TransactionMessage({
        payerKey: fromKeyPair.publicKey,
        recentBlockhash: blockHash,
        instructions: [transfer],
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)
    transaction.sign([fromKeyPair])

    const sc = searcherClient(blockEngineUrl, fromKeyPair)
    const bundleTransactionLimit = parseInt(
        process.env.BUNDLE_TRANSACTION_LIMIT || "5"
    )

    await sendBundle(
        sc,
        [transaction],
        bundleTransactionLimit,
        connection,
        fromKeyPair
    )
}
// Function to request sol to a particular account: Remember to use clusterURL("devnet") in connection before you request airdrop
const requestAirdrop = async (
    connection: Connection,
    publicKey: PublicKey
) => {
    await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL
    )
}

// Function to send tokens from one account to another

const sendSplToken = async (
    connection: Connection,
    fromKeyPair: Keypair,
    toKey: PublicKey,
    numOfToken: number
) => {
    const splToken = await import("@solana/spl-token")
    // Change mint address to that of your token
    const mintAddress = new PublicKey(
        "4JeGKgkrwcNJMESbJp5KrnQVmQdEffwr7zhicijz2BgC"
    )
    const accountInfo =
        await connection.getParsedAccountInfo(mintAddress)
    const tokenDecimals = (
        accountInfo.value?.data as ParsedAccountData
    ).parsed.info.decimals as number
    const tokenAccount =
        await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            mintAddress,
            fromKeyPair.publicKey
        )
    const destinationAccount =
        await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            mintAddress,
            toKey
        )
    const transfer = splToken.createTransferInstruction(
        tokenAccount.address,
        destinationAccount.address,
        fromKeyPair.publicKey,
        numOfToken * Math.pow(10, tokenDecimals)
    )
    const blockHash = (
        await connection.getLatestBlockhash("confirmed")
    ).blockhash

    const messageV0 = new TransactionMessage({
        payerKey: fromKeyPair.publicKey,
        recentBlockhash: blockHash,
        instructions: [transfer],
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)
    transaction.sign([fromKeyPair])

    const sc = searcherClient(blockEngineUrl, fromKeyPair)
    const bundleTransactionLimit = parseInt(
        process.env.BUNDLE_TRANSACTION_LIMIT || "5"
    )

    await sendBundle(
        sc,
        [transaction],
        bundleTransactionLimit,
        connection,
        fromKeyPair
    )
}

const mintToken = async (
    connection: Connection,
    fromKeyPair: Keypair
) => {
    const splToken = await import("@solana/spl-token")
    console.log("this is here")
    const mint = await splToken.createMint(
        connection,
        fromKeyPair,
        fromKeyPair.publicKey,
        null,
        9,
        undefined,
        {},
        splToken.TOKEN_PROGRAM_ID
    )

    console.log(1)
    const tokenAccount =
        await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            mint,
            fromKeyPair.publicKey
        )

    console.log(tokenAccount)
    await splToken.mintTo(
        connection,
        fromKeyPair,
        mint,
        tokenAccount.address,
        fromKeyPair.publicKey,
        1000000000000
    )
    // await token.mintTo
}

export {
    sendSolTrasaction,
    requestAirdrop,
    sendSplToken,
    mintToken,
}
