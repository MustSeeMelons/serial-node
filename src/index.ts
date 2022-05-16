import { SerialPort } from "serialport";
import { PortInfo } from "serialport/index";
import {
  getButtonUpdateMessage,
  getConfigRequestMessage,
  getConfirmMessage,
} from "./packet";
import { processChunk } from "./chunk-processor";
import { outLoop, addMessage, addConfirm } from "./out";
import { MessageId } from "./definitions";
import {
  addPacket,
  clearIncomingMessage,
  isIncomingMessageComplete,
  getIncomingMessage,
} from "./in";

const vendorId = "2886";
const productId = "802f";

// For retry testing HW
let failCounter = 0;
const failMax = 0;

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

    if (!packet) {
      return;
    }

    // Transform packet into a message
    addPacket(packet);

    // Get current message
    const incomingMessage = getIncomingMessage();

    if (incomingMessage.msgId === MessageId.CONFIRM_MESSAGE) {
      // Pass confirm to our out loop
      addConfirm(packet.data[0]);
      // No confirmation needed, just clear the incoming message
      clearIncomingMessage();
    } else {
      // Send confirmation for the packet
      if (failCounter < failMax) {
        failCounter++;
        console.log(`not confirming: ${failCounter} < ${failMax}`);
        return;
      }

      failCounter = 0;

      // Sending confirm that we got this packet
      const confirmMessage = getConfirmMessage(packet.msgId);
      addMessage(confirmMessage);

      if (isIncomingMessageComplete()) {
        console.log("incoming message", incomingMessage);

        // Here we would do stuff and then reset the message
        clearIncomingMessage();
      }
    }
  });

  setInterval(() => {
    outLoop(port);
  }, 50);

  // Asking for config
  const msg = getConfigRequestMessage();
  addMessage(msg);
};

main();
