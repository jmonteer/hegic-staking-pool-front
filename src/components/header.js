import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useHegicContract } from '../contracts/useContract'
import { ethers } from 'ethers';
import { injected } from '../connectors'
import { useEagerConnect, useInactiveListener } from '../hooks'
import { Badge, Button, Col, Navbar} from 'reactstrap';
import { checkProperties } from 'ethers/lib/utils';

function Header(props) {
    const { account, library, chainId, active } = useWeb3React();
    const HEGIC = useHegicContract();

    const [hegicBalance, setHegicBalance] = useState(0);
    const [ETHBalance, setETHBalance] = useState(0);

   const truncateEtherValue = (str, maxDecimalDigits) => {
    if (str.includes(".")) {
      const parts = str.split(".");
      return parts[0] + "." + parts[1].slice(0, maxDecimalDigits);
    }
    return str;
  };

    const formatBN = (bn) => {
        return truncateEtherValue(ethers.utils.commify(ethers.utils.formatEther(bn.toString())), 4);
    }

    const truncateAddress = (str) => {
        const len = str.length;
        return str.substring(0, 8) + '...' + str.substring(len-7, len-1);
    }

    useEffect(() => {
        if(!!account && !!library)
            HEGIC.balanceOf(account).then((balance) => setHegicBalance(balance));
    }, [account, library, chainId, HEGIC])

    useEffect(() => {
        if(!!account && !!library)
            library.getBalance(account).then((balance) => setETHBalance(balance))
    }, [account, library, chainId])

    const Wallet = () => {
        return (
            <>
                <Col sm='0' md={{size:2, offset:5}} style={{display:'flex', justifyContent:'center'}}>
                    <h3 style={{color:'#45fff4', zIndex:'99', fontFamily:'Jura', fontWeight:'bold'}}>HEGIC</h3>
                </Col>
                <Col sm='12' md={{size:4, offset:1}} style={{display:'flex', justifyContent:'flex-end'}}>
                { active ? (
                    <div>
                        <Badge color="primary" style={{margin:"2.5px"}}>{formatBN(hegicBalance)} HEGIC </Badge>
                        <Badge color="secondary" style={{margin:"2.5px"}}>{formatBN(ETHBalance)} ETH </Badge>
                        <span style={{color:'#defefe', fontSize:'12px'}}>{truncateAddress(account)}</span>
                        <Button color="link" onClick={props.disconnect}>Disconnect</Button>
                    </div>
                ) : (
                    <Button color="link" onClick={props.connect}>Connect</Button>
                )}
                </Col>
            </>
        )
    }
    
    return (
            <Navbar style={{display:'flex', backgroundColor:'#19274d', borderBottom: '1px solid #45fff4'}}>
                <Wallet />
            </Navbar>
    );
}

export default Header;