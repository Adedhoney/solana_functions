import * as solana from "@solana/web3.js"
import bs58 from "bs58"
// import { decimal, mintAddress } from "./constants";
import "dotenv/config"

const decimal = 0
const mintAddress = ""
// if (!process.env.CONNECT_ENDPOINT) {
//     throw new Error(
//         "CONNECT_ENDPOINT is not defined in your environment variables."
//     )
// }
// const  = new solana.Connection(process.env.CONNECT_ENDPOINT, {
// 	wsEndpoint: process.env.WS_ENDPOINT,
// });

const QUICKNODE_RPC =
    "https://mainnet.helius-rpc.com/?api-key=7ac71d07-8188-40ac-bacc-d91d36b61b38"
const connection = new solana.Connection(
    QUICKNODE_RPC,
    "confirmed"
)

// const mintConnection = new solana.Connection(solana.clusterApiUrl("devnet"), {
// 	commitment: "confirmed",
// });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createWallet = async (id: number) => {
    try {
        const walletKeyPair = solana.Keypair.generate()
        const publicKey = walletKeyPair.publicKey.toString()
        const privateKey =
            walletKeyPair.secretKey.toString()

        const privateKeyBuffer = Buffer.from(
            walletKeyPair.secretKey
        )
        const privateKeyBase58 = bs58.encode(
            privateKeyBuffer
        )
        return {
            id,
            walletKeyPair,
            privateKeyBase58,
            publicKey,
        }
    } catch (error) {
        return false
    }
}

const getSolBalance = async (wallet: string) => {
    try {
        const walletAddress = new solana.PublicKey(wallet)
        const balance = await connection.getBalance(
            walletAddress
        )
        return balance / solana.LAMPORTS_PER_SOL // Convert lamports to SOL
    } catch (error) {
        console.error("Error getting SOL balance:", error)
        throw error
    }
}

async function getNumberDecimals(
    mintAddress: string
): Promise<number> {
    const info = await connection.getParsedAccountInfo(
        new solana.PublicKey(mintAddress)
    )
    const result = (
        info.value?.data as solana.ParsedAccountData
    ).parsed.info.decimals as number
    return result
}

const sendSolTransactionWithBase58 = async (
    fromPrivateKeyBase58: string,
    toKeyBase58: string,
    numOfSol: number
) => {
    // Create Keypair from the provided private key
    const fromKeyPair = solana.Keypair.fromSecretKey(
        bs58.decode(fromPrivateKeyBase58)
    )

    // Convert the toKeyBase58 string to a PublicKey object
    const toKey = new solana.PublicKey(toKeyBase58)

    // Build the transaction
    const transaction = new solana.Transaction().add(
        solana.SystemProgram.transfer({
            fromPubkey: fromKeyPair.publicKey,
            toPubkey: toKey,
            lamports: numOfSol * solana.LAMPORTS_PER_SOL,
        })
    )

    try {
        // Sign and confirm the transaction
        const signature =
            await solana.sendAndConfirmTransaction(
                connection,
                transaction,
                [fromKeyPair]
            )

        // Fetch the transaction details using the signature
        const transactionInfo =
            await connection.getTransaction(signature)

        // Extract relevant information from the transaction details
        const transactionHash = signature
        const transactionStatus = transactionInfo?.meta?.err
            ? false
            : true
        const solSent = numOfSol

        return {
            transactionHash,
            transactionStatus,
            solSent,
        }
    } catch (error) {
        console.error(
            "Error sending and confirming transaction:",
            error
        )
        return false
    }
}
const sendSplTokenWithBase58 = async (
    privateKeyBase68: string,
    toKeyBase58: string,
    numOfToken: number,
    tokenAddress: string
) => {
    try {
        const splToken = await import("@solana/spl-token")
        console.log("gets here1")

        const privateKey = Buffer.from(
            bs58.decode(privateKeyBase68)
        )
        console.log("gets here2")

        const fromKeyPair =
            solana.Keypair.fromSecretKey(privateKey)

        const mintAddress = new solana.PublicKey(
            tokenAddress
        )

        console.log("gets here3")

        const tokenAccount =
            await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                fromKeyPair,
                mintAddress,
                fromKeyPair.publicKey
            )

        console.log("gets here4")
        const destinationAccount =
            await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                fromKeyPair,
                mintAddress,
                new solana.PublicKey(toKeyBase58)
            )

        console.log("gets here5")
        const latestBlockHash =
            await connection.getLatestBlockhash("confirmed")

        const transaction = new solana.Transaction(
            latestBlockHash
        )
        transaction.add(
            splToken.createTransferInstruction(
                tokenAccount.address,
                destinationAccount.address,
                fromKeyPair.publicKey,
                numOfToken * Math.pow(10, decimal)
            )
        )

        console.log("gets here7")
        const signature =
            await solana.sendAndConfirmTransaction(
                connection,
                transaction,
                [fromKeyPair]
            )

        console.log("gets here7.11")
        const transactionInfo =
            await connection.getTransaction(signature)

        console.log("gets here8")

        // Extract relevant information from the transaction details
        const transactionHash = signature
        const transactionStatus = transactionInfo?.meta?.err
            ? false
            : true
        const splTokensSent = numOfToken

        console.log("gets here9")
        return {
            transactionHash,
            transactionStatus,
            splTokensSent,
        }
    } catch (error) {
        console.error("Error occurred:", error)
        return { transactionHash: false }
    }
}

const getSplTokenBalance = async (
    wallet: string,
    mintAddress: string
) => {
    try {
        const splToken = require("@solana/spl-token")

        const walletAddress = new solana.PublicKey(wallet)
        const tokenMintAddress = new solana.PublicKey(
            mintAddress
        )

        const tokenAccounts =
            await connection.getTokenAccountsByOwner(
                walletAddress,
                {
                    programId: splToken.TOKEN_PROGRAM_ID,
                }
            )

        if (tokenAccounts && tokenAccounts.value) {
            let totalBalance = BigInt(0)
            let foundTokenAccount = false
            tokenAccounts.value.forEach(
                (tokenAccount: {
                    account: { data: any }
                }) => {
                    const accountData =
                        splToken.AccountLayout.decode(
                            tokenAccount.account.data
                        )
                    const tokenMint = new solana.PublicKey(
                        accountData.mint
                    )

                    // Check if the token mint matches the specified tokenMintAddress
                    if (
                        tokenMint.toString() ===
                        tokenMintAddress.toString()
                    ) {
                        const balance = BigInt(
                            accountData.amount
                        ) // Convert to BigInt explicitly
                        totalBalance += balance
                        foundTokenAccount = true // Set flag to true since token account was found
                    }
                }
            )

            if (!foundTokenAccount) {
                return 0
            }
            const divider = BigInt(10) ** BigInt(decimal)
            return totalBalance / divider // Return total accumulated balance as string
        } else {
            console.log(
                "No token accounts found for the given wallet."
            )
            return 0 // Return "0" as a string if no token accounts found
        }
    } catch (error) {
        console.error(
            "Error retrieving token balances:",
            error
        )
        throw error // Rethrow the error for the caller to handle
    }
}

const sendSplTokenFromCentral = async (
    toKeyBase58: string,
    numOfToken: number
) => {
    const splToken = await import("@solana/spl-token")

    if (!process.env.CENTRAL_WALLET) {
        throw new Error(
            "CENTRAL_WALLET is not defined in your environment variables."
        )
    }
    const privateKeyBase68 = process.env.CENTRAL_WALLET

    const privateKey = Buffer.from(
        bs58.decode(privateKeyBase68)
    )

    const fromKeyPair =
        solana.Keypair.fromSecretKey(privateKey)

    const mintAddressSol = new solana.PublicKey(mintAddress)
    // const accountInfo = await connection.getParsedAccountInfo(mintAddressSol);
    // const tokenDecimals = (accountInfo.value?.data as solana.ParsedAccountData).parsed.info.decimals as number;
    const tokenAccount =
        await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            mintAddressSol,
            fromKeyPair.publicKey
        )
    const destinationAccount =
        await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            mintAddressSol,
            new solana.PublicKey(toKeyBase58)
        )
    const transaction = new solana.Transaction().add(
        splToken.createTransferInstruction(
            tokenAccount.address,
            destinationAccount.address,
            fromKeyPair.publicKey,
            numOfToken * Math.pow(10, decimal)
        )
    )
    const latestBlockHash =
        await connection.getLatestBlockhash("confirmed")
    transaction.recentBlockhash = latestBlockHash.blockhash
    const signature =
        await solana.sendAndConfirmTransaction(
            connection,
            transaction,
            [fromKeyPair]
        )
    const transactionInfo = await connection.getTransaction(
        signature
    )

    // Extract relevant information from the transaction details
    const transactionHash = signature
    const transactionStatus = transactionInfo?.meta?.err
        ? false
        : true
    const splTokensSent = numOfToken
    return {
        transactionHash,
        transactionStatus,
        splTokensSent,
    }
}

const sendSolFromCentral = async (
    toKeyBase58: string,
    numOfSol: number
) => {
    // Create Keypair from the provided private key
    if (!process.env.CENTRAL_WALLET) {
        throw new Error(
            "CENTRAL_WALLET is not defined in your environment variables."
        )
    }

    const privateKeyBase68 = process.env.CENTRAL_WALLET
    const fromKeyPair = solana.Keypair.fromSecretKey(
        bs58.decode(privateKeyBase68)
    )

    // Convert the toKeyBase58 string to a PublicKey object
    const toKey = new solana.PublicKey(toKeyBase58)

    // Retrieve the current block height
    const currentBlockHeight =
        await connection.getBlockHeight()

    // Calculate a reasonable block height limit (e.g., current block height + 50)
    const blockHeightLimit = currentBlockHeight + 50

    // Build the transaction
    const transaction = new solana.Transaction().add(
        solana.SystemProgram.transfer({
            fromPubkey: fromKeyPair.publicKey,
            toPubkey: toKey,
            lamports: numOfSol * solana.LAMPORTS_PER_SOL,
        })
    )

    // Set the block height limit for the transaction
    transaction.lastValidBlockHeight = blockHeightLimit

    try {
        // Sign and confirm the transaction
        const signature =
            await solana.sendAndConfirmTransaction(
                connection,
                transaction,
                [fromKeyPair]
            )

        // Fetch the transaction details using the signature
        const transactionInfo =
            await connection.getTransaction(signature)

        // Extract relevant information from the transaction details
        const transactionHash = signature
        const transactionStatus = transactionInfo?.meta?.err
            ? false
            : true
        const solSent = numOfSol

        return {
            transactionHash,
            transactionStatus,
            solSent,
        }
    } catch (error: any) {
        if (error.name === "TokenAccountNotFoundError") {
            console.log(
                "Custom handling for TokenAccountNotFoundError:",
                error.message
            )
            return 0 // Handle the error specific to TokenAccountNotFoundError here
        } else {
            console.error(
                "Error retrieving token balances:",
                error
            )
            throw error // Rethrow the error for the caller to handle
        }
    }
}

export {
    getSolBalance,
    createWallet,
    sendSolTransactionWithBase58,
    sendSplTokenWithBase58,
    getSplTokenBalance,
    sendSplTokenFromCentral,
    sendSolFromCentral,
}
