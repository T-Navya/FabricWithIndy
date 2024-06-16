echo $IP

echo "DID registered successfully"

echo "Seed passed as input is issuer00000000000000000000000000"
PORTS="8060:8060 8061:8061" ./run_docker start --endpoint http://localhost:8060 \
--label scr \
--auto-ping-connection \
--auto-respond-messages \
--auto-accept-invites \
--auto-accept-requests \
--auto-respond-credential-offer \
--auto-store-credential \
--inbound-transport http 0.0.0.0 8060 \
--outbound-transport http \
--admin 0.0.0.0 8061 \
--admin-insecure-mode \
--wallet-type indy \
--wallet-name issuerwallet \
--wallet-key issuerkey \
--genesis-url http://0.0.0.0:9000/genesis \
--seed issuer00000000000000000000000000 \