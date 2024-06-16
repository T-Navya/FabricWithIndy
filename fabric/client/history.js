const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


async function main() {
    try {
        // Load Hyperledger Fabric connection profile
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Setup Fabric wallet and gateway
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const userId = 'appUser';
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // Get Fabric network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('credentials');


           const historyRes = await contract.evaluateTransaction('historyOfTransactions', 'CRED3');
           console.log(`History Response: ${historyRes.toString()}`);
      
    }

catch (error) {
    console.error(`Failed to complete the process: ${error}`);
    process.exit(1);
}
}
main()