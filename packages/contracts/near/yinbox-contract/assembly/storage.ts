/*
NOTE: This file is not in used and is here as reference for of future refactoring
*/

import { PersistentVector, storage, u128 } from "near-sdk-as";
import { Conversation } from "./models";

export const conversationStore = new PersistentVector<Conversation>("conversation");

export const get_contract_owner = (): string => {
  return storage.getPrimitive<string>("contract_owner", "");
}
export const set_contract_owner = (contract_owner: string): void => {
  storage.set("contract_owner", contract_owner);
}

export const generate_conversation_id = (): i32 => {
  const newId = storage.getPrimitive<i32>("current_conversation_id", 0) + 1;
  storage.set("current_conversation_id", newId);
  return newId;
}
