
const indy = require('indy-sdk');
const { initIndy } = require('./indy_setup');

async function createProof() {
    const poolHandle = await initIndy();
    const walletConfig = { id: 'prover_wallet' };
    const walletCredentials = { key: 'prover_wallet_key' };

    try {
        await indy.createWallet(walletConfig, walletCredentials);
    } catch (error) {
        if (error.message !== 'WalletAlreadyExistsError') {
            throw error;
        }
    }

    const proverWallet = await indy.openWallet(walletConfig, walletCredentials);
    const masterSecretId = await indy.proverCreateMasterSecret(proverWallet, 'master_secret');

    const schema = {
        name: 'identity_schema',
        version: '1.0',
        attributes: ['name', 'address']
    };

    const [schemaId, schemaDef] = await indy.issuerCreateSchema('issuerDid', schema.name, schema.version, schema.attributes);
    const [credDefId, credDef] = await indy.issuerCreateAndStoreCredentialDef(proverWallet, 'issuerDid', schemaDef, 'TAG1', 'CL', { support_revocation: false });

    const requestedAttributes = {
        'attr1_referent': { name: 'name' }
    };

    const requestedPredicates = {};

    const proofRequest = {
        name: 'proof_req_1',
        version: '0.1',
        nonce: '123432421212',
        requested_attributes: requestedAttributes,
        requested_predicates: requestedPredicates
    };

    const creds = await indy.proverGetCredentialsForProofReq(proverWallet, proofRequest);
    const credForAttr1 = creds.attrs.attr1_referent[0].cred_info;

    const requestedCredentials = {
        self_attested_attributes: {},
        requested_attributes: {
            attr1_referent: { cred_id: credForAttr1.referent, revealed: true }
        },
        requested_predicates: {}
    };

    const schemas = {};
    schemas[schemaId] = schemaDef;

    const credDefs = {};
    credDefs[credDefId] = credDef;

    const revocStates = {};

    const proof = await indy.proverCreateProof(proverWallet, proofRequest, requestedCredentials, masterSecretId, schemas, credDefs, revocStates);

    console.log('Proof:', proof);
}

createProof().catch(console.error);
