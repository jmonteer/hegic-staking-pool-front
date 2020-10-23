import { createContext } from 'react';

const PoolContext = createContext(
    {
        balances: {},
        lots: []
    });

export {
    PoolContext
};

