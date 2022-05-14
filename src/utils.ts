import { DATA_MAX, IMessage, IPacket } from "./packet";

export const setPacketChecksum = (packet: IPacket): void => {
  packet.checksum ^= packet.msgId;
  packet.checksum ^= packet.packetCount;
  packet.checksum ^= packet.packetNum;
  packet.checksum ^= packet.dataLength;

  for (let i = 0; i < packet.dataLength; i++) {
    packet.checksum ^= packet.data[i];
  }
};

export const getNextPacket = (msg: IMessage) => {
  const packet: IPacket = {
    msgId: msg.msgId,
    packetNum: msg.lastPacketNumber,
    packetCount: msg.totalPacketCount,
    dataLength: 0,
    data: [],
    checksum: 0,
  };

  for (let i = 0; i < DATA_MAX; i++) {
    if (msg.nextIndex + i >= msg.dataLength) {
      break;
    }

    packet.data[i] = msg.data[msg.nextIndex + i];
    packet.dataLength++;
  }

  msg.nextIndex += packet.dataLength;

  setPacketChecksum(packet);

  return packet;
};
