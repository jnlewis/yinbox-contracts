/*
NOTE: This file is not in used and is here as reference for of future refactoring
*/

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
