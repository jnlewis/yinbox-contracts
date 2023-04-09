# Yinbox NEAR Smart Contract

## Getting Started

Pre-requisite: [NEAR CLI](https://docs.near.org/docs/tools/near-cli#installation)

#### Login NEAR CLI
Login to NEAR CLI on your local machine. You only need to do this once.
`yarn login`

#### Install dependencies
Clone this repository and run the following commands in terminal from within the repository folder.

`cd contracts/near/yinbox-contract`
`yarn`

#### Build
Build the smart contract.

`yarn build`

#### Deploy to Testnet
Deploy to testnet. Please see `package.json` file to configure the `deploy:testnet` script to deploy to the appropriate account.

`yarn deploy:testnet`

#### Interacting With the Contract

Examples: Refer to `scripts` folder.
