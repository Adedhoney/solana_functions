import * as solana from "@solana/web3.js"
import { ethers } from "ethers"
import dotenv from "dotenv"

dotenv.config()

export const getSolTransactionDetails = async (
    transactionHash: string
) => {
    // Connect to a Solana cluster (mainnet-beta in this case)
    const connection = new solana.Connection(
        solana.clusterApiUrl("mainnet-beta")
    )

    // Get the transaction details
    let transactionDetails: solana.VersionedTransactionResponse
    try {
        const details = await connection.getTransaction(
            transactionHash,
            {
                maxSupportedTransactionVersion: 0,
                commitment: "finalized",
            }
        )
        if (details) {
            transactionDetails = details
            console.log(transactionDetails)
            console.log(
                transactionDetails.transaction.message.getAccountKeys()
                    .staticAccountKeys[1]
            )
        } else return
    } catch (error) {
        throw new Error(
            "Failed to fetch transaction details: " +
                (error as Error).message
        )
    }

    // Extract the block time and transaction amount
    const blockTime = transactionDetails.blockTime

    let time: Date | null = null
    if (blockTime) {
        time = new Date(blockTime * 1000)
    }

    let amountSent = 0
    if (!transactionDetails) {
        throw new Error("Transaction not found")
    }
    transactionDetails.transaction.signatures.forEach(
        (account, index) => {
            if (!transactionDetails.meta) {
                return
            }
            if (
                transactionDetails.meta.postBalances[
                    index
                ] <
                transactionDetails.meta.preBalances[index]
            ) {
                amountSent +=
                    transactionDetails.meta.preBalances[
                        index
                    ] -
                    transactionDetails.meta.postBalances[
                        index
                    ]
            }
        }
    )

    return {
        time,
        amountSent: amountSent / solana.LAMPORTS_PER_SOL, // Convert lamports to SOL
    }
}

export const getEthTransactionDetails = async (
    transactionHash: string
) => {
    const provider = new ethers.InfuraProvider(
        "mainnet",
        process.env.INFURIA_KEY
    )

    let transactionDetails
    try {
        transactionDetails = await provider.getTransaction(
            transactionHash
        )
        if (!transactionDetails) {
            throw new Error("Transaction not found")
        }
    } catch (error) {
        throw new Error(
            "Failed to fetch transaction details: " +
                (error as Error).message
        )
    }

    let transactionReceipt
    try {
        transactionReceipt =
            await provider.getTransactionReceipt(
                transactionHash
            )
        if (!transactionReceipt) {
            throw new Error("Transaction receipt not found")
        }
    } catch (error) {
        throw new Error(
            "Failed to fetch transaction receipt: " +
                (error as Error).message
        )
    }

    if (!transactionDetails.blockNumber) {
        console.log("no block number")
        return
    }
    const block = await provider.getBlock(
        transactionDetails.blockNumber
    )
    if (!block) {
        console.log("no block")
        return
    }
    const time = new Date(block.timestamp * 1000)

    const amountSent = ethers.formatEther(
        transactionDetails.value
    )

    return {
        time: time,
        amountSent: amountSent, // Amount in Ether
    }
}

// Example usage
// const ethTransactionHash =
//     "0x5e70c8644feaed7a999a63ab5e3e778e9993fd5cdbe09e1aa8c9624e09d1eba7"
// getEthTransactionDetails(ethTransactionHash)
//     .then((details) => {
//         console.log("Transaction Time:", details?.time)
//         console.log(
//             "Amount Sent:",
//             details?.amountSent,
//             "ETH"
//         )
//     })
//     .catch((error) => {
//         console.error("Error:", error.message)
//     })

// Example usage
const solTransactionHash =
    "RvEsgF8fWcW2tSAxLPi4VmwJy2xhAoismrTiYfwXq62b9jPgUbWnxWtXcLQshkUNnzmQ5XzCF7Cat6b8iZd7NU5"
getSolTransactionDetails(solTransactionHash)
    .then((details) => {
        console.log("Transaction Time:", details?.time)
        console.log(
            "Amount Sent:",
            details?.amountSent,
            "SOL"
        )
    })
    .catch((error) => {
        console.error("Error:", error.message)
    })
