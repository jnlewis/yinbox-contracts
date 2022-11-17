import { PersistentVector, storage, u128 } from "near-sdk-as";
import { Conversation } from "./models";

export const conversationStore = new PersistentVector<Conversation>("conversation");

export const get_contract_owner = (): string => {
  return storage.getPrimitive<string>("contract_owner", "");
}
export const set_contract_owner = (contract_owner: string): void => {
  storage.set("contract_owner", contract_owner);
}

export const get_fee = (): u128 => {
  return storage.get<u128>("fee", u128.Zero) as u128;
}
export const set_fee = (fee: u128): void => {
  storage.set("fee", fee);
}

export const generate_conversation_id = (): i32 => {
  const newId = storage.getPrimitive<i32>("current_conversation_id", 0) + 1;
  storage.set("current_conversation_id", newId);
  return newId;
}
