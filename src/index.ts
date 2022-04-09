import {SerialPort} from "serialport";


const vendorId = "2886";
const productId = "802F";

(async () => {
    const portInfo = await SerialPort.list();

    const port = portInfo.find((p) => p.vendorId === vendorId && p.productId === productId);

    console.log(port);
})();
