import Notify from "bnc-notify";
import { ethers } from "ethers";

const isString = (thing) => typeof thing === "string" || thing instanceof String;

const isAddress = (thing) => thing && isString(thing) && ethers.utils.isHexString(thing) && thing.length === 42;

const isTransactionHash = (thing) => thing && isString(thing) && ethers.utils.isHexString(thing) && thing.length === 66;

const notify = Notify({
  dappId: process.env.BLOCKNATIVE_API_KEY,
  networkId: process.env.NETWORK_ID || 4, // Default to rinkeby
});

const displayNotification = ({
  address,
  autoDismiss = 4000,
  eventCode = "notice",
  hash,
  message,
  onclick = () => {},
  type = "success",
}) => {
  console.log("displayNotification", {
    address,
    autoDismiss,
    eventCode,
    hash,
    message,
    onclick,
    type,
  });

  const notificationObject = {
    autoDismiss,
    eventCode,
    message,
    onclick,
    type,
  };

  let notificationResponse = {};

  if (isString(message)) {
    notificationResponse = notify.notification(notificationObject);
  }

  if (isAddress(address)) {
    const { emitter } = notify.account(address);
    return { ...notificationResponse, emitter };
  }

  if (isTransactionHash(hash)) {
    const { emitter } = notify.hash(hash);
    return { ...notificationResponse, emitter };
  }

  return notificationResponse;
};

export default displayNotification;
