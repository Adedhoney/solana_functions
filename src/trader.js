const { ethers } = require("ethers")
require("dotenv").config()

console.log(`private: ${process.env.PRIVATE_KEY}`)
console.log(`infura: ${process.env.INFURIA_KEY}`)
console.log(process.env.INFURIA_KEY)

// return;

// Ethereum network settings
const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURIA_KEY}`
)
const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
)
// Contract addresses and ABI
const uniswapRouterAddress =
    "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008" // Uniswap v2 Router address for mainnet
const uniswapRouterABI = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
]

const uniswapRouterContract = new ethers.Contract(
    uniswapRouterAddress,
    uniswapRouterABI,
    wallet
)

// Token addresses
const tokenAddress =
    "0x2bB4FE2e136A12f9f1B10eb0729B87a7dA7Dee50" // Example: Uniswap token address

// Function to execute the trade
async function executeTrade(amountIn, amountOutMin) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now
    const path = [
        "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        tokenAddress,
    ]
    //const path = [ethers.constants.AddressZero, tokenAddress]; // Trading ETH for token

    // Execute the trade
    const tx =
        await uniswapRouterContract.swapExactETHForTokens(
            amountOutMin,
            path,
            wallet.address,
            deadline,
            { value: amountIn, gasLimit: 500000 }
        )

    await tx.wait()
    console.log("Trade successful!")
}

// Example usage
const amountInEth = ethers.utils.parseEther("0.02") // Amount of ETH to trade (in Ether)
const amountOutMin = 0 // Minimum amount of token expected to receive

executeTrade(amountInEth, amountOutMin)
    .then(() => {
        console.log("Trade executed successfully.")
    })
    .catch((error) => {
        console.error("Error executing trade:", error)
    })
