import { setPacketChecksum } from "./utils";
import { MessageId } from "./definitions";

export const PACKET_SIZE = 16;

export const DATA_MAX = PACKET_SIZE - 5;
const MESSAGE_DATA_MAX = 255;

// Packet data indexes
export const MSG_ID_IDX = 0;
export const PACKET_NUM_IDX = 1;
export const TOTAL_PACKETS_IDX = 2;
export const DATA_LENGTH_IDX = 3;
export const DATA_IDX = 4;
export const CHECKSUM_IDX = PACKET_SIZE - 1;

export interface IPacket {
  msgId: number; // What message this packet is for
  packetNum: number; // Which packet of the message is this
  packetCount: number; // Total packet count for the message
  dataLength: number; // Data length of the packet - for shorter packets
  data: number[]; // Le data
  checksum: number; // Checksum of the packet
}

export interface IMessage {
  msgId: number;
  dataLength: number;
  lastPacketNumber: number;
  totalPacketCount: number;
  nextIndex: number;
  data: number[];
}

export const getConfigRequestMessage = () => {
  const data: number[] = ["c".charCodeAt(0), "\\n".charCodeAt(0)];

  const message: IMessage = {
    msgId: MessageId.CONFIG_REQUEST,
    lastPacketNumber: 0,
    totalPacketCount: Math.ceil(data.length / PACKET_SIZE),
    data,
    dataLength: data.length,
    nextIndex: 0,
  };

  return message;
};

export const getConfirmMessage = (msgId: number) => {
  const data: number[] = [msgId];

  const message: IMessage = {
    msgId: MessageId.CONFIRM_MESSAGE,
    lastPacketNumber: 0,
    totalPacketCount: Math.ceil(data.length / PACKET_SIZE),
    data,
    dataLength: data.length,
    nextIndex: 0,
  };

  return message;
};

export const getLargeMessage = () => {
  const data: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];

  const message: IMessage = {
    msgId: MessageId.BTN_UPDATE,
    lastPacketNumber: 0,
    totalPacketCount: Math.ceil(data.length / DATA_MAX),
    data,
    dataLength: data.length,
    nextIndex: 0,
  };

  return message;
};

export const getButtonUpdateMessage = (config: number[]) => {
  const data: number[] = config;

  data[3] = 69;
  data[18] = 42;
  data[33] = 7;

  const message: IMessage = {
    msgId: MessageId.BTN_UPDATE,
    lastPacketNumber: 0,
    totalPacketCount: Math.ceil(data.length / DATA_MAX),
    data,
    dataLength: data.length,
    nextIndex: 0,
  };

  return message;
};

export const getConfirmPacket = (msgId: number): IPacket => {
  const packet: IPacket = {
    msgId: 69,
    packetNum: 0,
    packetCount: 1,
    dataLength: 1,
    data: [msgId],
    checksum: 0,
  };

  setPacketChecksum(packet);

  return packet;
};

export const getPacketBytes = (packet: IPacket): number[] => {
  const arr = [];

  arr.push(packet.msgId);
  arr.push(packet.packetNum);
  arr.push(packet.packetCount);
  arr.push(packet.dataLength);
  arr.push(...packet.data);
  arr.push(packet.checksum);

  return arr;
};
