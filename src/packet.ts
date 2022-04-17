export const PACKET_SIZE = 16;

const DATA_MAX = PACKET_SIZE - 5;
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

export const getConfigRequestPacket = (): IPacket => {
  const packet: IPacket = {
    msgId: 1,
    packetNum: 0,
    packetCount: 1,
    dataLength: 2,
    data: ["c".charCodeAt(0), "\\n".charCodeAt(0)],
    checksum: 0,
  };

  packet.checksum ^= packet.msgId;
  packet.checksum ^= packet.packetCount;
  packet.checksum ^= packet.packetNum;
  packet.checksum ^= packet.dataLength;

  for (let i = 0; i < packet.dataLength; i++) {
    packet.checksum ^= packet.data[i];
  }

  return packet;
};

export const getPacketBytes = (packet: IPacket) => {
  const arr = [];

  arr.push(packet.msgId);
  arr.push(packet.packetNum);
  arr.push(packet.packetCount);
  arr.push(packet.dataLength);
  arr.push(...packet.data);
  arr.push(packet.checksum);

  return arr;
};
