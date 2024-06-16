const indy = require('indy-sdk');
const { initIndy } = require('./indy_setup');

async function verifyProof() {
    const poolHandle = await initIndy();
    const walletConfig = { id: 'verifier_wallet' };
    const walletCredentials = { key: 'verifier_wallet_key' };

    try {
        await indy.createWallet(walletConfig, walletCredentials);
    } catch (error) {
        if (error.message !== 'WalletAlreadyExistsError') {
            throw error;
        }
    }

    const verifierWallet = await indy.openWallet(walletConfig, walletCredentials);

    const proofRequest = {
        name: 'proof_req_1',
        version: '0.1',
        nonce: '123432421212',
        requested_attributes: {
            'attr1_referent': { name: 'name' }
        },
        requested_predicates: {}
    };

    const proof = {
        "requested_proof": {
            "revealed_attrs": {
                "attr1_referent": {
                    "sub_proof_index": 0,
                    "raw": "Alice",
                    "encoded": "123456789"
                }
            },
            "self_attested_attrs": {},
            "unrevealed_attrs": {},
            "predicates": {}
        },
        "proof": {
            "proofs": [
                {
                    "primary_proof": {
                        "eq_proof": {},
                        "ge_proofs": []
                    },
                    "non_revoc_proof": null
                }
            ],
            "aggregated_proof": {}
        },
        "identifiers": [
            {
                "schema_id": "schemaId",
                "cred_def_id": "credDefId",
                "rev_reg_id": null,
                "timestamp": null
            }
        ]
    };

    const schemas = {
        "schemaId": {
            "name": "identity_schema",
            "version": "1.0",
            "attributes": ["name", "address"]
        }
    };

    const credDefs = {
        "credDefId": {
            "id": "credDefId",
            "schemaId": "schemaId",
            "type": "CL",
            "tag": "TAG1",
            "value": {
                "primary": {},
                "revocation": null
            }
        }
    };

    const revocRegs = {};

    const valid = await indy.verifierVerifyProof(proofRequest, proof, schemas, credDefs, revocRegs, revocRegs);
    console.log('Proof valid:', valid);
}

verifyProof().catch(console.error);
