import { BigInt } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent
} from "../generated/SushiToken/SushiToken"
import {
  Approval,
  DelegateChanged,
  DelegateVotesChanged,
  OwnershipTransferred,
  Transfer,
  TokenHolder,
  Whale
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  let entity = new DelegateChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.delegator = event.params.delegator
  entity.fromDelegate = event.params.fromDelegate
  entity.toDelegate = event.params.toDelegate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDelegateVotesChanged(
  event: DelegateVotesChangedEvent
): void {
  let entity = new DelegateVotesChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.delegate = event.params.delegate
  entity.previousBalance = event.params.previousBalance
  entity.newBalance = event.params.newBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let sender = TokenHolder.load(event.params.from.toHexString());
  if (!sender) {
    sender = new TokenHolder(event.params.from.toHexString());
    sender.balance = new BigInt(0);
  } else {
    sender.balance = sender.balance.minus(event.params.value);
  }
  sender.save();

  let receiver = TokenHolder.load(event.params.to.toHexString());
  if (!receiver) {
    receiver = new TokenHolder(event.params.to.toHexString());
    receiver.balance = event.params.value;
  } else {
    receiver.balance = receiver.balance.plus(event.params.value);
  }
  receiver.save();

  let whale_sender = Whale.load(event.params.from.toHexString());
  if (!whale_sender && sender.balance.gt(new BigInt(500000))) {
    whale_sender = new Whale(event.params.from.toHexString());
    whale_sender.balance = sender.balance;
    whale_sender.save();
  } else if (whale_sender) {
    whale_sender.balance = sender.balance;
    whale_sender.save();
  }

  let whale_receiver = Whale.load(event.params.to.toHexString());
  if (!whale_receiver && receiver.balance.gt(new BigInt(500000))) {  // > 500k Sushi is a whale
    whale_receiver = new Whale(event.params.to.toHexString());
    whale_receiver.balance = receiver.balance;
    whale_receiver.save();
  } else if (whale_receiver) {
    whale_receiver.balance = receiver.balance;
    whale_receiver.save();
  }
  receiver.save();
  
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
