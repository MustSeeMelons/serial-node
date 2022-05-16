import { SerialPort } from "serialport";
import { MessageId } from "./definitions";
import { getPacketBytes, IMessage } from "./packet";
import { getCurrentMillis, getNextPacket } from "./utils";

// Messages that need to be sent
const messageQueue: IMessage[] = [];

let millis = 0;
let bytesToSend: number[] = [];

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
  if (
    messageQueue.length > 0 &&
    confirm !== undefined &&
    Math.abs(getCurrentMillis() - millis) > 500
  ) {
    port.write(bytesToSend);
    millis = getCurrentMillis();
    console.log("resend");
    return;
  }

  if (messageQueue.length > 0 && confirm === undefined) {
    const c = messageQueue.find((m) => m.msgId === MessageId.CONFIRM_MESSAGE);

    // If we have a confirm in the queue - send it first
    if (c) {
      const packet = getNextPacket(c);
      console.log("sending", packet);
      bytesToSend = getPacketBytes(packet);
      port.write(bytesToSend);

      const cIndex = messageQueue.indexOf(c);
      messageQueue.splice(cIndex, 1);
      return;
    }

    // Get current message
    const msg = messageQueue[0];

    // Get next packet from the message
    const packet = getNextPacket(msg);
    console.log("sending", packet);

    // Transform packet into bytes to send
    bytesToSend = getPacketBytes(packet);
    // console.log("bytes", bytesToSend);

    // Send the bytes
    port.write(bytesToSend);

    // We dont confirm confirmations, that would be crazy
    if (msg.msgId !== MessageId.CONFIRM_MESSAGE) {
      confirm = msg.msgId;
    } else {
      messageQueue.splice(0, 1);
    }
  }
};
