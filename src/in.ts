import { MessageId } from "./definitions";
import { IMessage, IPacket } from "./packet";

const incomingMesage: IMessage = {
  data: [],
  dataLength: 0,
  nextIndex: 0,
  lastPacketNumber: 0,
  totalPacketCount: 0,
  msgId: MessageId.INVALID,
};

export const clearIncomingMessage: () => void = () => {
  incomingMesage.data.length = 0;
  incomingMesage.dataLength = 0;
  incomingMesage.msgId = MessageId.INVALID;
  incomingMesage.nextIndex = 0;
  incomingMesage.totalPacketCount = 0;
  incomingMesage.lastPacketNumber = 0;
};

export const isIncomingMessageComplete: () => boolean = () => {
  return (
    incomingMesage.totalPacketCount - 1 === incomingMesage.lastPacketNumber
  );
};

export const getIncomingMessage: () => IMessage = () => {
  return incomingMesage;
};

// Adds packet to messafe
// Ignores it if we already have recieved it
export const addPacket: (packet: IPacket) => void = (packet: IPacket) => {
  if (
    incomingMesage.totalPacketCount !== 0 &&
    incomingMesage.lastPacketNumber === packet.packetNum
  ) {
    return;
  }

  incomingMesage.msgId = packet.msgId;
  incomingMesage.totalPacketCount = packet.packetCount;
  incomingMesage.lastPacketNumber = packet.packetNum;
  incomingMesage.data.push(...packet.data.slice(0, packet.dataLength));
  incomingMesage.dataLength += packet.dataLength;
};
