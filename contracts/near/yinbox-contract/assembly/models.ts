import { u128 } from "near-sdk-as";

@nearBindgen
export class Conversation {
  conversation_id: i32;
  participant_a: string;
  participant_b: string;
  created_by: string;
  fee_paid: u128;
  status: string;
}
