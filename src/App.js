import React from 'react';
import Dashboard from './components/dashboard';
import Header from './components/header'
import Intro from './components/intro'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers';
import { useEagerConnect, useInactiveListener } from './hooks'
import { injected } from './connectors';

function getLibrary(provider, connector) {
  return new ethers.providers.Web3Provider(provider)
}

function App() {
  const context = useWeb3React()
  const { connector, active, activate, deactivate } = context

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = React.useState()
    React.useEffect(() => {
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
  <div style={{ background:'radial-gradient(68.28% 53.52% at 50% 50%, #1c2a4f 0%, #111b35 100%)'}}>
      <div style={{backgroundImage:'url(https://www.hegic.co/assets/img/background-image.svg)', height:'100vh'}}>
          <Header connect={connect} disconnect={disconnect}/>
          { active ? (
            <Dashboard />
          ) : (
            <Intro connect={connect} />
          )}
          {/* <Stats /> */}
      </div>
  </div>

  );
}


export default () => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>
)
