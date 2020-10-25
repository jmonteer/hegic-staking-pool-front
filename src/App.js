import React, { useContext, useState, useEffect } from 'react';
import Dashboard from './components/dashboard';
import Header from './components/header'
import Intro from './components/intro'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers';
import { useEagerConnect, useInactiveListener } from './hooks'
import { injected } from './connectors';
import { WalletContext } from './context/Wallet';
import { useHegicContract, usePooledStakingETHContract } from './contracts/useContract'
function getLibrary(provider, connector) {
  return new ethers.providers.Web3Provider(provider)
}

function App() {
  const [ETHBalance, setETHBalance] = useState(ethers.BigNumber.from('0'));
  const [HEGICBalance, setHEGICBalance] = useState(ethers.BigNumber.from('0'));
  const [sHEGICBalance, setSHEGICBalance] = useState(ethers.BigNumber.from('0'));
  const [HEGICAllowance, setHEGICAllowance] = useState(ethers.BigNumber.from('0'));
  const balances = {
    ETHBalance: {value: ETHBalance, setValue: setETHBalance},
    HEGICBalance: {value: HEGICBalance, setValue: setHEGICBalance},
    sHEGICBalance: {value: sHEGICBalance, setValue: setSHEGICBalance}
  }

  const allowances = {
    HEGICAllowance: {value: HEGICAllowance, setValue: setHEGICAllowance}
  }

  const context = useWeb3React()
  const { connector, active, activate, deactivate, account, library, chainId } = context
  
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState()
  useEffect(() => {
  if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
  }
  }, [activatingConnector, connector])
  
  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()
  
  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
  
  function connect() {
      setActivatingConnector(injected)
      activate(injected)
  }
  
  function disconnect() {
  deactivate(injected)
  }

  return (
  <WalletContext.Provider value={{context, connect, disconnect, balances, allowances}}>
    <div style={{ background:'radial-gradient(68.28% 53.52% at 50% 50%, #1c2a4f 0%, #111b35 100%)'}}>
        <div style={{backgroundImage:'url(https://www.hegic.co/assets/img/background-image.svg)', height:'100vh'}}>
            <Header />
            { active ? (
              <Dashboard />
            ) : (
              <Intro />
            )}
            {/* <Stats /> */}
        </div>
    </div>
  </WalletContext.Provider>
  );
}


export default () => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>
)
