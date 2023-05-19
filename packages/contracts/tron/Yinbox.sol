// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract Yinbox {
    event ConversationCreated(uint256 conversationCode, string conversationType, string conversationId, address creator, uint256 createdDateTime);

    using Counters for Counters.Counter;
    Counters.Counter private conversationCodes;

    address private owner;

    modifier ownerOnly {
        require(msg.sender == owner, "Only contract owner can access this resource.");
        _;
    }

    struct Conversation {
        uint256 conversationCode;
        string conversationType;
        string conversationId;
        address creator;
        string status;
        uint256 createdDateTime;
    }

    mapping(address => Conversation[]) private conversations;
    mapping(string => uint256) private fees;
    mapping(string => uint256) private quotas;

    constructor() {
        owner = msg.sender;
        fees["direct"] = 0;
        fees["privateGroup"] = 0;
        fees["publicChannel"] = 0;
        quotas["direct"] = 10;
        quotas["privateGroup"] = 10;
        quotas["publicChannel"] = 10;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function setOwner(address newOwner) public ownerOnly {
        owner = newOwner;
    }

    function getConversations(address creator) public view returns (Conversation[] memory) {
        return conversations[creator];
    }

    function getConversationsFlat(address creator) public view returns (uint256[] memory, string[] memory, string[] memory) {
        uint length = conversations[creator].length;

        uint256[] memory resultConversationCodes = new uint256[](length);
        string[] memory resultConversationTypes = new string[](length);
        string[] memory resultConversationIds = new string[](length);
        // address[] memory resultCreators = new address[](length);
        // string[] memory resultStatuses = new string[](length);
        // uint256[] memory resultCreatedDateTimes = new uint256[](length);

        for (uint i = 0; i < length; i++) {
            Conversation memory conversation = conversations[creator][i];
            resultConversationCodes[i] = conversation.conversationCode;
            resultConversationTypes[i] = conversation.conversationType;
            resultConversationIds[i] = conversation.conversationId;
            // resultCreators[i] = conversation.creator;
            // resultStatuses[i] = conversation.status;
            // resultCreatedDateTimes[i] = conversation.createdDateTime;
        }

        return (resultConversationCodes, resultConversationTypes, resultConversationIds);
    }

    function setFee(string memory conversationType, uint256 fee) public ownerOnly {
        fees[conversationType] = fee;
    }

    function getFee(string memory conversationType) public view returns (uint256) {
        return fees[conversationType];
    }

    function setQuota(string memory conversationType, uint256 quota) public ownerOnly {
        quotas[conversationType] = quota;
    }

    function getQuota(string memory conversationType) public view returns (uint256) {
        return quotas[conversationType];
    }

    function createConversation(string memory conversationType, string memory conversationId) public payable {
        uint256 requiredFee = getFee(conversationType);
        uint256 maxQuota = getQuota(conversationType);
        uint256 usedQuota = 0;

        // Check usage quota and collect fee
        if (requiredFee > 0) {
            for (uint256 i = 0; i < conversations[msg.sender].length; i++) {
                if (keccak256(bytes(conversations[msg.sender][i].conversationType)) == keccak256(bytes(conversationType))) {
                    usedQuota++;
                }
            }

            if (usedQuota >= maxQuota) {
                require(msg.value >= requiredFee, "Fee required to create additional conversations.");
            }
        }

        // Refund excess fee, if any
        if (msg.value > requiredFee) {
            uint256 excessFee = msg.value - requiredFee;
            payable(msg.sender).transfer(excessFee);
        }

        // Create new conversation
        conversationCodes.increment();
        uint256 code = conversationCodes.current();

        conversations[msg.sender].push(
            Conversation({
                conversationCode: code,
                conversationType: conversationType,
                conversationId: conversationId,
                creator: msg.sender,
                status: "unlocked",
                createdDateTime: block.timestamp
            })
        );

        emit ConversationCreated(code, conversationType, conversationId, msg.sender, block.timestamp);
    }
}
