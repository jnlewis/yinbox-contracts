import {
  Context,
  PersistentVector,
  PersistentMap,
  logging,
  u128,
  env,
  ContractPromiseBatch,
} from "near-sdk-as";

// ConversationCreated event
@nearBindgen
export class ConversationCreatedEvent {
  constructor(
    public conversationCode: u64,
    public conversationType: string,
    public conversationId: string,
    public creator: string,
    public createdDateTime: u64
  ) {}
}

// Conversation type
@nearBindgen
export class Conversation {
  constructor(
    public conversationCode: u64,
    public conversationType: string,
    public conversationId: string,
    public creator: string,
    public status: string,
    public createdDateTime: u64
  ) {}
}

const conversations = new PersistentMap<string, PersistentVector<Conversation>>(
  "c"
);
const fees = new PersistentMap<string, u128>("f");
const quotas = new PersistentMap<string, u64>("q");
let owner: string = env.isValidAccountID(Context.sender) ? Context.sender : "";
let conversationCodes: u64 = 0;

// Initialize default values for the contract
export function initContract(): void {
  assert(owner == "", "Contract has already been initialized.");
  owner = Context.sender;
  fees.set("direct", u128.Zero);
  fees.set("privateGroup", u128.Zero);
  fees.set("publicChannel", u128.Zero);
  quotas.set("direct", 10);
  quotas.set("privateGroup", 10);
  quotas.set("publicChannel", 10);
}

export function getOwner(): string {
  return owner;
}

export function setOwner(newOwner: string): void {
  assert(
    Context.sender == owner,
    "Only contract owner can access this resource."
  );
  owner = newOwner;
}

export function getConversations(creator: string): Conversation[] | null {
  return persistentVectorToArray<Conversation>(conversations.get(creator)!);
}

export function setFee(conversationType: string, fee: u128): void {
  assert(
    Context.sender == owner,
    "Only contract owner can access this resource."
  );
  fees.set(conversationType, fee);
}

export function getFee(conversationType: string): u128 {
  return fees.getSome(conversationType);
}

export function setQuota(conversationType: string, quota: u64): void {
  assert(
    Context.sender == owner,
    "Only contract owner can access this resource."
  );
  quotas.set(conversationType, quota);
}

export function getQuota(conversationType: string): u64 {
  return quotas.getSome(conversationType);
}

export function createConversation(
  conversationType: string,
  conversationId: string
): void {
  const requiredFee = getFee(conversationType);
  const maxQuota = getQuota(conversationType);
  let usedQuota: u64 = 0;

  if (!conversations.contains(Context.sender)) {
    conversations.set(
      Context.sender,
      new PersistentVector<Conversation>(Context.sender)
    );
  }
  const senderConversations = conversations.getSome(Context.sender);

  // Check usage quota and collect fee
  if (u128.gt(requiredFee, u128.Zero)) {
    for (let i = 0; i < senderConversations.length; i++) {
      if (senderConversations[i].conversationType == conversationType) {
        usedQuota++;
      }
    }

    if (usedQuota >= maxQuota) {
      assert(
        Context.attachedDeposit >= requiredFee,
        "Fee required to create additional conversations."
      );
    }
  }

  // Refund excess fee, if any
  if (Context.attachedDeposit > requiredFee) {
    let excessFee = u128.sub(Context.attachedDeposit, requiredFee);
    ContractPromiseBatch.create(Context.sender).transfer(excessFee);
  }

  // Create new conversation
  conversationCodes++;
  const code = conversationCodes;
  const createdDateTime = Context.blockTimestamp;

  const newConversation = new Conversation(
    code,
    conversationType,
    conversationId,
    Context.sender,
    "unlocked",
    createdDateTime
  );
  senderConversations.push(newConversation);

  // Emit ConversationCreated event
  const event = new ConversationCreatedEvent(
    code,
    conversationType,
    conversationId,
    Context.sender,
    createdDateTime
  );
  logging.log(event);
}

function persistentVectorToArray<T>(vector: PersistentVector<T>): Array<T> {
  const result: Array<T> = new Array<T>(vector.length);
  for (let i = 0; i < vector.length; i++) {
    result[i] = vector[i];
  }
  return result;
}
