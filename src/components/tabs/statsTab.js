import React, { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { useWeb3React } from '@web3-react/core';
import { useStakingPoolContract } from '../../contracts/useContract';
import { Row, Col, Card, CardTitle, CardText } from 'reactstrap'

function StatsTab() {
    const {account, library} = useWeb3React();
    const stakingPool = useStakingPoolContract();
    
    const [ethTotalBalance, setEthTotalBalance] = useState()
    const [ethLockedBalance, setEthLockedBalance] = useState()
    const [wbtcTotalBalance, setWbtcTotalBalance] = useState()
    const [wbtcLockedBalance, setWbtcLockedBalance] = useState()
    const [ethNumberOfStakingLots, setEthNumberOfStakingLots] = useState()
    const [wbtcNumberOfStakingLots, setWbtcNumberOfStakingLots] = useState()
    const [feeRecipient, setFeeRecipient] = useState();

    useEffect(() => {
        if(!!account && !!library){
            stakingPool.totalBalance().then((x) => setEthTotalBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            stakingPool.lockedBalance().then((x) => setEthLockedBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            stakingPool.totalNumberOfStakingLots().then((x) => setEthNumberOfStakingLots(x.toString()));
            stakingPool.FEE_RECIPIENT().then((x) => setFeeRecipient(x));
        }
    });
    
    return (
        <Row>
            <Col sm="12">
            <Card body>
                <CardTitle><h3>Stats</h3></CardTitle>
                <div style={{textAlign:'center'}}>
                    <h2>COMING SOON!</h2>
                </div>
                    {/* <span>Fee recipient is {feeRecipient}</span><br></br>
                    <span>ETH {ethLockedBalance}/{ethTotalBalance}</span><br></br>
                    <span>WBTC {wbtcLockedBalance}/{wbtcTotalBalance}</span><br></br>
                    <span>Number of staking lots ETH {ethNumberOfStakingLots}</span><br></br>
                    <span>Number of staking lots WBTC {wbtcNumberOfStakingLots}</span> */}
                </Card>
            </Col>
        </Row>

    );
}
export default StatsTab;