'use strict';

const { Contract } = require('fabric-contract-api');
const UserCredentials = require('./lib/userCredentials');


 // Install a relevant ZKP library



class CredentialsContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const credentials = [];
        for (let i = 0; i < credentials.length; i++) {
            await ctx.stub.putState('CRED' + i, Buffer.from(JSON.stringify(credentials[i])));
            console.info('Added <--> ', credentials[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createCredential(ctx, payload) {
        console.info('============= START : Create Driving License ===========');
        const mspId= await ctx.clientIdentity.getMSPID();
        console.log("orgMSPID in chaincode",mspId);
        if(mspId=='Org1MSP'){
       
       console.log("payload createCredential",payload);
       const transientAttribute=ctx.stub.getTransient();
       const data=transientAttribute.get('uploadTransientData')?.toString();
        let pvtData =JSON.parse(data);
        let parsedPayload=JSON.parse(payload);
        console.log("pvtData",pvtData);
        console.log("pvt data",pvtData,typeof pvtData,parsedPayload.pvtDataKey,parsedPayload);
        let res= await ctx.stub.putState(parsedPayload.credentialId, Buffer.from(JSON.stringify(parsedPayload)));
        console.log("res",res);

        let pvtRes= await ctx.stub.putPrivateData('issuerCollection',parsedPayload.pvtDataKey,(JSON.stringify(pvtData)));
        console.log("pvtRes",pvtRes);
  
        console.info('============= END : Create Driving License ===========');
        return 'record is created'
        }
        else{
            return 'Not authorized to createCredential'
        }
    }

    async queryCredential(ctx, credentialId) {
        const credentialAsBytes = await ctx.stub.getState(credentialId);
        if (!credentialAsBytes || credentialAsBytes.length === 0) {
            throw new Error(`${credentialId} does not exist`);
        }
        console.log(credentialAsBytes.toString());
        return credentialAsBytes.toString();
    }

    
    async updatePublicDataCredential(ctx,payload){
        const mspId= await ctx.clientIdentity.getMSPID();
        console.log("orgMSPID in chaincode",mspId);
        if(mspId=='Org1MSP'){
            let parsedPayload = JSON.parse(payload);
            console.log("payload in update method",parsedPayload);
          let res=  await ctx.stub.putState(parsedPayload.credentialId, Buffer.from(JSON.stringify(parsedPayload)));
          return res;
        }
        else{
          return 'Not Authorized to update the credential';
        }
    }

    async verifyCredential(ctx, credentialId, requestedAttributesJSON) {
        const credentialAsBytes = await ctx.stub.getState(credentialId);
        if (!credentialAsBytes || credentialAsBytes.length === 0) {
            throw new Error(`${credentialId} does not exist`);
        }

        const credential = JSON.parse(credentialAsBytes.toString());
        const requestedAttributes = JSON.parse(requestedAttributesJSON);
        const response = {};

        for (const attr of requestedAttributes) {
            if (credential[attr]) {
                response[attr] = credential[attr];
            }
        }

        return JSON.stringify(response);
    }


    async historyOfTransactions(ctx, key) {
        if (!key || key.trim() === '') {
            throw new Error('Invalid key. Key cannot be an empty string.');
        }

        console.log(`Getting history for key: ${key}`);

        const iterator = await ctx.stub.getHistoryForKey(key);
        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                const record = {};
                record.txId = res.value.txId;
                record.timestamp = res.value.timestamp;
                try {
                    record.value = res.value.value.toString();
                } catch (err) {
                    record.value = res.value.value.toString();
                }
                allResults.push(record);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }

 
    
}



module.exports = CredentialsContract;

