# https://explorer.testnet.near.org/accounts/yinbox.jeffreylewis.testnet
export MAINID=jeffreylewis.testnet
export CONTRACTID=yinbox.jeffreylewis.testnet
export ALICEID=jeffreylewis-alice.testnet
export BOBID=jeffreylewis-bob.testnet

# Init
near call $CONTRACTID initContract '{}' --accountId $CONTRACTID

# View owner
near call $CONTRACTID getOwner '{}' --accountId $MAINID

# Create Conversation as Alice
near call $CONTRACTID createConversation '{ 
    "conversationType": "direct"
    "conversationId": "test-conversation-1"
    }' --accountId $ALICEID --deposit 0.1

# View Conversations
near call $CONTRACTID getConversations '{ "creator": "'$ALICEID'" }' --accountId $ALICEID
