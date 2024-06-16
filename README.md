# To bring up the fabric network

./network.sh up createChannel -ca -c mychannel -s couchdb

# To deploy the chaincode


./network.sh deployCC -ccn credentials -ccp ./chaincode/credentials -ccl javascript
./network.sh deployCC -ccn credentials -ccp ./chaincode/credentials -ccl javascript -cccg ./collection.json 
connection.json for client

# URL for couchDB

http://localhost:5984/_utils/#
## curl commands
curl http://admin:adminpw@127.0.0.1:5984/mychannel_credentials/_all_docs
curl http://admin:adminpw@127.0.0.1:5984/mychannel_credentials'$$'hissuerCollection/_all_docs
curl http://admin:adminpw@127.0.0.1:5984/mychannel_credentials'$$'pissuerCollection/_all_docs

# VON-Network setup
## Note: Change all the docker files wrt aries and indy network files to  Python version 3.6 as below:
ARG python_version=3.6
FROM  silverlogic/python3.6

## clone von network and its dependencies
git clone https://github.com/bcgov/von-network.git
cd von-network
pip install -r server/requirements.txt

## Update the libraries
apt-get update
apt-get install -y \
   build-essential \
   pkg-config \
   cmake \
   libssl-dev \
   libsqlite3-dev \
   libzmq3-dev \
   libncursesw5-dev

## Libsodium 

cd /tmp
#download and install libsodium library
curl https://download.libsodium.org/libsodium/releases/old/unsupported/libsodium-1.0.14.tar.gz | tar -xz

chmod 777 -R libsodium-1.0.14/
cd /tmp/libsodium-1.0.14
#build and install library
./configure --disable-shared && \
   make && \
   make install
#removed downloaded package
rm -rf /tmp/libsodium-1.0.14


## commands
 ./manage build

 ./manage start WEB_SERVER_HOST_PORT=9000 "LEDGER_INSTANCE_NAME=Indy Ledger" &

# ISSUER CREDS 
Seed: issuer00000000000000000000000000
DID: VV9pK5ZrLPRwYmotgACPkC
Verkey: GXUnLHyrYogGzyeiFLXdLv9EjEy8ZJN7XFnuSuN3Dn9M

