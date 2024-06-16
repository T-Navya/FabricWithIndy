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

        // Aries setup
        const ariesAdminUrl = 'http://localhost:8061';

        let pvtData={
         "dob":"1990-01-01",
         "licenseClass":"Class B",
        }
        
        let transaction = contract.createTransaction('createCredential');
        console.log("pvtData",Buffer.from(JSON.stringify(pvtData)));
        transaction.setTransient({
            uploadTransientData: Buffer.from(JSON.stringify(pvtData))
        });
        // Example: Create a driving license credential on Fabric (ctx, credentialId, issuer, name, address, dob, licenseClass, expiryDate) 

        // await contract.submitTransaction('createCredential', 'CRED1', 'LicensingAuthority', 'John Doe', '123 Main St', '1990-01-01', 'Class B', '2025-01-01');
       let nonPhi={
        "credentialId":"CRED1",
        "issuer":"LicensingAuthority",
        "name":"John Doe",
        "address":"123 Main St",
        "expiryDate":"2025-01-01"
       }
        const finalPayload=await transaction.submit(JSON.stringify(nonPhi));
        console.log('Driving license credential created',finalPayload);

        // Example: Query a credential on Fabric
        const result = await contract.evaluateTransaction('queryCredential', 'CRED1');
        console.log(`Credential queried: ${result.toString()}`);


        const requestedAttributes = JSON.stringify(['name', 'address']);
        const verifyResult = await contract.evaluateTransaction('verifyCredential', 'CRED1', requestedAttributes);
        console.log(`Credential verified with selective disclosure: ${verifyResult.toString()}`);
        // Example: Create a schema on Aries
        const schemaResponse = await axios.post(`${ariesAdminUrl}/schemas`, {
            schema_name: 'DriverLicense',
            schema_version: '1.0',
            attributes: ['name', 'address', 'dob', 'licenseClass', 'expiryDate']
        });
        const schemaId = schemaResponse.data.schema_id;
        console.log(`Schema created: ${schemaId}`);

        // Example: Create a credential definition on Aries
        const credDefResponse = await axios.post(`${ariesAdminUrl}/credential-definitions`, {
            schema_id: schemaId
        });
        const credDefId = credDefResponse.data.credential_definition_id;
        console.log(`Credential Definition created: ${credDefId}`);

        // Assume we have an established connection with the user
        const connectionId = 'CONNECTION_ID';  // Replace with actual connection ID

        // Issue a credential
        await axios.post(`${ariesAdminUrl}/issue-credential/send`, {
            connection_id: connectionId,
            cred_def_id: credDefId,
            credential_proposal: {
                "@type": "issue-credential/1.0/credential-preview",
                "attributes": [
                    { "name": "name", "value": "John Doe" },
                    { "name": "address", "value": "123 Main St" },
                    { "name": "dob", "value": "1990-01-01" },
                    { "name": "licenseClass", "value": "Class B" },
                    { "name": "expiryDate", "value": "2025-01-01" }
                ]
            }
        });
        console.log('Credential issued');

        // Request proof with selective disclosure
        const proofRequestResponse = await axios.post(`${ariesAdminUrl}/present-proof/send-request`, {
            connection_id: connectionId,
            proof_request: {
                name: 'Proof of Address',
                version: '1.0',
                requested_attributes: {
                    attr1_referent: { name: 'name' },
                    attr2_referent: { name: 'address' }
                },
                requested_predicates: {}
            }
        });
        console.log('Proof request sent');
        console.log(`Proof request ID: ${proofRequestResponse.data.presentation_exchange_id}`);

        // Clean up
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to complete the process: ${error}`);
        process.exit(1);
    }
}

main();