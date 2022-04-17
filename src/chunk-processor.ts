import {
  CHECKSUM_IDX,
  DATA_IDX,
  DATA_LENGTH_IDX,
  IPacket,
  MSG_ID_IDX,
  PACKET_NUM_IDX,
  PACKET_SIZE,
  TOTAL_PACKETS_IDX,
} from "./packet";

const buffer: number[] = [];

export const processChunk = (chunk: Buffer): IPacket | undefined => {
  // Stash the incoming data
  chunk.forEach((val) => {
    buffer.push(val);
  });

  return parsePacket();
};

/**
 * Try to find a packet in our bufer
 */
export const parsePacket = (): IPacket | undefined => {
  const msgId = buffer[MSG_ID_IDX];
  const packetNum = buffer[PACKET_NUM_IDX];
  const packetCount = buffer[TOTAL_PACKETS_IDX];
  const dataLength = buffer[DATA_LENGTH_IDX];
  const checksum = buffer[CHECKSUM_IDX];

  if (
    msgId === undefined ||
    packetCount === undefined ||
    packetNum === undefined ||
    dataLength === undefined ||
    checksum === undefined
  ) {
    // Don't have a valid packet yet
    return;
  }

  // Create a packet from data recieved
  const packet: IPacket = {
    msgId,
    packetNum,
    packetCount,
    dataLength,
    data: buffer.slice(DATA_IDX, PACKET_SIZE - 1),
    checksum,
  };

  // Remove the used bytes
  buffer.splice(0, PACKET_SIZE);

  return packet;
};
