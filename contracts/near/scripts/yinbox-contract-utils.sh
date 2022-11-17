# https://explorer.testnet.near.org/accounts/yinbox.jeffreylewis.testnet
export MAINID=jeffreylewis.testnet
export CONTRACTID=yinbox.jeffreylewis.testnet
export ALICEID=jeffreylewis-alice.testnet
export BOBID=jeffreylewis-bob.testnet

# Init
near call $CONTRACTID init '{ "owner_id": "yinbox.jeffreylewis.testnet" }' --accountId $MAINID

# Set fee to 0.5 near
near call $CONTRACTID owner_set_config_fee '{ "fee": "500000000000000000000000" }' --accountId $MAINID

# View owner
near call $CONTRACTID get_owner '{}' --accountId $MAINID
near call $CONTRACTID get_config_fee '{}' --accountId $MAINID

# View Conversations
near call $CONTRACTID get_all_conversations '{}' --accountId $MAINID

near call $CONTRACTID get_conversation '{
    "sender": "'$ALICEID'", 
    "recipient": "'$BOBID'"
    }' --accountId $MAINID

# Create Conversation as Alice
near call $CONTRACTID create_conversation '{ 
    "recipient": "'$BOBID'"
    }' --accountId $ALICEID --deposit 0.1
