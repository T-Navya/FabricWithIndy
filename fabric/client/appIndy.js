const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const indy = require('../indy/indy'); // Import the Indy module

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function main() {
    try {
        // Step 1: Enroll Admin and Register User
        await enrollAdmin();
        await registerUser();

        // Step 2: Create and Issue Indy Credentials
        await indy.createDidAndCredential();

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('credentials');

        // Step 3: Use Indy Credentials to Issue Fabric Credential
        const credData = await indy.getCredentialData(); // Implement this function in indy.js to retrieve the issued credential data
        await contract.submitTransaction('issueCredential', 'cred1', credData.name, 'IssuerA', '2023-01-01', credData.kycData);
        console.log('Credential issued');

        const result = await contract.evaluateTransaction('verifyCredential', 'cred1');
        console.log(`Credential: ${result.toString()}`);

        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function enrollAdmin() {
    try {
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const adminIdentity = await wallet.get('admin');
        if (adminIdentity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

async function registerUser() {
    try {
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(caInfo.url);

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('appUser', x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main();
