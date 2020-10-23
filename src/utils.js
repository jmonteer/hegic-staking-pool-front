import { ethers } from 'ethers'

const truncateEtherValue = (str, maxDecimalDigits) => {
    if (str.includes(".")) {
    const parts = str.split(".");
    return parts[0] + "." + parts[1].slice(0, maxDecimalDigits);
    }
    return str;
};

const formatBN = (bn) => {
    return ethers.utils.commify(ethers.utils.formatEther(bn.toString()));
}

const truncateAddress = (str) => {
    const len = str.length;
    return str.substring(0, 8) + '...' + str.substring(len-7, len-1);
}

export {
    truncateEtherValue,
    formatBN, 
    truncateAddress
}