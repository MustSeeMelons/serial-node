import { PacketLengthParser, SerialPort } from "serialport";
import { PortInfo } from "serialport/index";
import {
  getConfigRequestMessage,
  getConfirmMessage,
  getLargeMessage,
} from "./packet";
import { processChunk } from "./chunk-processor";
import { outLoop, addMessage, addConfirm } from "./out";
import { MessageId } from "./definitions";

const vendorId = "2886";
const productId = "802f";

const getPort = async () => {
  const portInfo = await SerialPort.list();

  return portInfo.find(
    (p) =>
      p.vendorId?.toLowerCase() === vendorId &&
      p.productId?.toLowerCase() === productId
  );
};

const openPort = (portInfo: PortInfo) => {
  return new Promise<SerialPort | Error>((resolve, reject) => {
    const port = new SerialPort(
      {
        baudRate: 9600,
        path: portInfo.path,
      },
      (err) => {
        if (err) {
          reject(err);
        }

        resolve(port);
      }
    );
  });
};

const main = async () => {
  const portInfo = await getPort();

  const port = await openPort(portInfo);

  if (port instanceof Error) {
    console.error(`Failed to open port: ${portInfo.path}`);
    return;
  }

  port.on("data", (chunk) => {
    const packet = processChunk(chunk);
    packet && console.log("recieved", packet);

    if (packet && packet.msgId == MessageId.CONFIRM_MESSAGE) {
      // data[0] has the id of the message we are confirming
      addConfirm(packet.data[0]);
    } else if (packet && packet.packetCount > 1) {
      const msg = getConfirmMessage(packet.msgId);
      addMessage(msg);
    }
  });

  setInterval(() => {
    outLoop(port);
  }, 100);

  // Asking for config
  const msg = getConfigRequestMessage();
  addMessage(msg);

  // Sending a large message
  const largeMsg = getLargeMessage();
  addMessage(largeMsg);
};

main();
