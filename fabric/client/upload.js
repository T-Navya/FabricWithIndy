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

        
        let pvtData={
         "dob":"1990-01-02",
         "licenseClass":"Class C",
        }
        
        let transaction = contract.createTransaction('createCredential');
        console.log("pvtData",Buffer.from(JSON.stringify(pvtData)));
        transaction.setTransient({
            uploadTransientData: Buffer.from(JSON.stringify(pvtData))
        });
        // Example: Create a driving license credential on Fabric (ctx, credentialId, issuer, name, address, dob, licenseClass, expiryDate) 

    let nonPhi={
        "credentialId":"CRED3",
        "pvtDataKey":"PVT2@CRED3",
        "issuer":"LicensingAuthority1",
        "name":"John Doe3",
        "address":"123 Main St3",
        "expiryDate":"2025-01-02"
       }
        const finalPayload=await transaction.submit(JSON.stringify(nonPhi));
        console.log('Driving license credential created',finalPayload);
    }

catch (error) {
    console.error(`Failed to complete the process: ${error}`);
    process.exit(1);
}
}
main()