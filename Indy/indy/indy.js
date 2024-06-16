const indy = require('indy-sdk');
const fs = require('fs');
const path = require('path');

const poolName = 'pool';
const walletConfig = {'id': 'wallet'};
const walletCredentials = {'key': 'wallet_key'};

async function createDidAndCredential() {
    // Step 1: Open Pool Ledger
    const poolConfig = { "genesis_txn": path.join(__dirname, 'genesis.txn') };
    await indy.setProtocolVersion(2);
    await indy.createPoolLedgerConfig(poolName, poolConfig).catch(() => {});
    const poolHandle = await indy.openPoolLedger(poolName, undefined);

    // Step 2: Create Wallet
    await indy.createWallet(walletConfig, walletCredentials).catch(() => {});
    const wallet = await indy.openWallet(walletConfig, walletCredentials);

    // Step 3: Create DID
    const [issuerDid, issuerKey] = await indy.createAndStoreMyDid(wallet, {});
    console.log(`Issuer DID: ${issuerDid}`);

    // Step 4: Prepare DID for the Holder
    const [holderDid, holderKey] = await indy.createAndStoreMyDid(wallet, {});
    console.log(`Holder DID: ${holderDid}`);

    // Step 5: Create Schema and Credential Definition
    const schema = {
        "name": "KYC",
        "version": "1.0",
        "attributes": ["name", "date_of_birth"]
    };
    const [schemaId, schemaJson] = await indy.issuerCreateSchema(issuerDid, schema.name, schema.version, schema.attributes);
    const [credDefId, credDefJson] = await indy.issuerCreateAndStoreCredentialDef(wallet, issuerDid, schemaJson, 'TAG1', 'CL', '{"support_revocation": false}');

    // Step 6: Issue Credential
    const credOffer = await indy.issuerCreateCredentialOffer(wallet, credDefId);
    const credRequest = await indy.proverCreateCredentialReq(wallet, holderDid, credOffer, credDefJson, holderKey);
    const credentialValues = {
        "name": { "raw": "Alice", "encoded": "1139481716457488690172217916278103335" },
        "date_of_birth": { "raw": "2000-01-01", "encoded": "20000101" }
    };
    const [cred, _, __] = await indy.issuerCreateCredential(wallet, credOffer, credRequest, credentialValues, null, -1);
    await indy.proverStoreCredential(wallet, null, credRequest, cred, credDefJson, null);

    console.log('Credential issued successfully');
}

createDidAndCredential().catch(console.error);
