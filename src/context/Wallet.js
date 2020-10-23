import { createContext } from 'react';

const WalletContext = createContext(
    {
        context: {},
        balances: {},
        allowances: {},
        connect: () => {},
        disconnect: () => {}
    });

export {
    WalletContext
};

