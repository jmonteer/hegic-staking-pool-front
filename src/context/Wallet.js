import { createContext } from 'react';

const WalletContext = createContext(
    {
        context: {},
        balances: {},
        allowances: {},
        poolConditions: {},
        profits: {},
        connect: () => {},
        disconnect: () => {}
    });

export {
    WalletContext
};

