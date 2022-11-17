import { context, logging, u128 } from "near-sdk-as";
import { Conversation } from "./models";
import {
  get_contract_owner,
  set_contract_owner,
  set_fee,
  conversationStore,
  get_fee,
  generate_conversation_id,
} from "./storage";

// INIT

export function init(owner_id: string): void {
  const contract_owner = get_contract_owner();
  if (contract_owner == "") {
    logging.log("[init] Failed: Contract already initialized.");
    return;
  }
  set_contract_owner(owner_id);
}

// OWNER ONLY METHODS

export function owner_set_config_fee(fee: u128): void {
  assert(
    context.sender === get_contract_owner(),
    "This method can only be invoked by contract owner."
  );
  set_fee(fee);
}

export function owner_delete_conversation(conversation_id: i32): void {
  assert(
    context.sender === get_contract_owner(),
    "This method can only be invoked by contract owner."
  );
  delete_conversation(conversation_id);
}

export function owner_set_new_owner(new_owner_id: string): void {
  assert(
    context.sender === get_contract_owner(),
    "This method can only be invoked by contract owner."
  );
  set_contract_owner(new_owner_id);
}

// VIEW METHODS

export function get_owner(): string {
  return get_contract_owner();
}

export function get_config_fee(): u128 {
  return get_fee();
}

export function get_all_conversations(): Conversation[] {
  const result = new Array<Conversation>(conversationStore.length);
  for (let i = 0; i < conversationStore.length; i++) {
    result[i] = conversationStore[i];
  }
  return result;
}

export function get_conversation(
  sender: string,
  recipient: string
): Conversation | null {
  for (let i = 0; i < conversationStore.length; i++) {
    if (
      (conversationStore[i].participant_a == sender &&
        conversationStore[i].participant_b == recipient) ||
      (conversationStore[i].participant_b == sender &&
        conversationStore[i].participant_a == recipient)
    ) {
      return conversationStore[i];
    }
  }

  return null;
}

// WRITE METHODS

export function create_conversation(recipient: string): void {

  const sender = context.sender;

  // Check if conversation already exist
  const existingConversation = get_conversation(sender, recipient);
  assert(existingConversation == null, "Conversation already exist.");

  // Check fee amount
  // TODO: if user attached more deposit than the minimum fee, refund them the balance
  const received_deposit = context.attachedDeposit;
  const min_fee = get_config_fee();
  logging.log(
    "[create_conversation] Received deposit: " + received_deposit.toString()
  );
  logging.log(
    "[create_conversation] Minimum deposit: " + min_fee.toString()
  );
  // assert(received_deposit >= min_fee, "Insufficient fee. The minimum required fee is " + min_fee.toString());

  // Generate new conversation ID
  const new_conversation_id = generate_conversation_id();

  // Create conversation record
  const conversation: Conversation = {
    conversation_id: new_conversation_id,
    participant_a: sender,
    participant_b: recipient,
    created_by: sender,
    fee_paid: received_deposit,
    status: "unlocked",
  };
  conversationStore.push(conversation);

  logging.log(
    "[create_conversation] Successful: conversation_id: " + new_conversation_id.toString()
  );
}

// HELPERS

function delete_conversation(conversation_id: i32): void {
  let removeIndex = -1;

  for (let i = 0; i < conversationStore.length; i++) {
    if (conversationStore[i].conversation_id == conversation_id) {
      removeIndex = i;
      break;
    }
  }

  if (removeIndex >= 0) {
    conversationStore.swap_remove(removeIndex);
  }
}
