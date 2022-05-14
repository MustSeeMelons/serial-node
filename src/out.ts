import { SerialPort } from "serialport";
import { MessageId } from "./definitions";
import { getPacketBytes, IMessage } from "./packet";
import { getNextPacket } from "./utils";

// Messages that need to be sent
const messageQueue: IMessage[] = [];

// Confirmation we are waiting for
let confirm: number = undefined;

/**
 * Add a confirmation, so the main loop may continue
 */
export const addConfirm = (msgConfirmationId: number) => {
  if (confirm === msgConfirmationId) {
    console.log(`confirming msg ${confirm}`);

    confirm = undefined;
    const nextMsg = messageQueue[0];

    if (nextMsg && nextMsg.nextIndex >= nextMsg.dataLength) {
      messageQueue.splice(0, 1);
    }
  }
};

/**
 * Queue up a message to be sent
 */
export const addMessage = (message: IMessage) => {
  messageQueue.push(message);
};

/**
 * Sends queued up messages
 */
export const outLoop = (port: SerialPort) => {
  // TODO queue needs a timer for resend
  if (messageQueue.length > 0 && confirm === undefined) {
    // Get current message
    const msg = messageQueue[0];

    // Get next packet from the message
    const packet = getNextPacket(msg);
    console.log("sending", packet);

    // Transform packet into bytes to send
    const bytes = getPacketBytes(packet);
    console.log("bytes", bytes);

    // Send the bytes
    port.write(bytes);

    // We dont confirm confirmations, that would be crazy
    if (msg.msgId !== MessageId.CONFIRM_MESSAGE) {
      confirm = msg.msgId;
    } else {
      messageQueue.splice(0, 1);
    }
  }
};
