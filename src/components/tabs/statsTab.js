import React, { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { useWeb3React } from '@web3-react/core';
import { usePooledStakingETHContract, usePooledStakingWBTCContract } from '../../contracts/useContract';
import { Row, Col, Card, CardTitle } from 'reactstrap'

function StatsTab() {
    const {account, library} = useWeb3React();
    const pooledStakingETH = usePooledStakingETHContract();
    const pooledStakingWBTC = usePooledStakingWBTCContract();
    
    const [ethTotalBalance, setEthTotalBalance] = useState()
    const [ethLockedBalance, setEthLockedBalance] = useState()
    const [wbtcTotalBalance, setWbtcTotalBalance] = useState()
    const [wbtcLockedBalance, setWbtcLockedBalance] = useState()
    const [ethNumberOfStakingLots, setEthNumberOfStakingLots] = useState()
    const [wbtcNumberOfStakingLots, setWbtcNumberOfStakingLots] = useState()
    const [feeRecipient, setFeeRecipient] = useState();

    useEffect(() => {
        if(!!account && !!library){
            pooledStakingETH.totalBalance().then((x) => setEthTotalBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            pooledStakingETH.lockedBalance().then((x) => setEthLockedBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            pooledStakingWBTC.totalBalance().then((x) => setWbtcTotalBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            pooledStakingWBTC.lockedBalance().then((x) => setWbtcLockedBalance(ethers.utils.commify(ethers.utils.formatEther(x.toString()))));
            pooledStakingETH.numberOfStakingLots().then((x) => setEthNumberOfStakingLots(x.toString()));
            pooledStakingWBTC.numberOfStakingLots().then((x) => setWbtcNumberOfStakingLots(x.toString()));
            pooledStakingETH.FEE_RECIPIENT().then((x) => setFeeRecipient(x));
        }
    });
    
    return (
        <Row>
            <Col sm="12">
            <Card body>
                <CardTitle><h3>Stats</h3></CardTitle>
                    <span>Fee recipient is {feeRecipient}</span><br></br>
                    <span>ETH {ethLockedBalance}/{ethTotalBalance}</span><br></br>
                    <span>WBTC {wbtcLockedBalance}/{wbtcTotalBalance}</span><br></br>
                    <span>Number of staking lots ETH {ethNumberOfStakingLots}</span><br></br>
                    <span>Number of staking lots WBTC {wbtcNumberOfStakingLots}</span>
                </Card>
            </Col>
        </Row>

    );
}
// class Stats extends React.Component {
//     constructor(props){
//     super(props)
//     this.state = {
//         ethTotalBalance: '',
//         ethLockedBalance: '',
//             wbtcTotalBalance: '',
//             wbtcLockedBalance: '',
//             feeRecipient: '',
//             wbtcNumberOfStakingLots: '',
//             ethNumberOfStakingLots: ''
//         }
//     }
    
//     async componentDidMount(){
//         const ethTotalBalance = await pooledStakingETH.totalBalance().then(x => x.toString())
//         const ethLockedBalance = await pooledStakingETH.lockedBalance().then(x => x.toString())
//         const wbtcTotalBalance = await pooledStakingWBTC.totalBalance().then(x => x.toString())
//         const wbtcLockedBalance = await pooledStakingWBTC.lockedBalance().then(x => x.toString())
//         const ethNumberOfStakingLots = await pooledStakingETH.numberOfStakingLots().then(x => x.toString())
//         const wbtcNumberOfStakingLots = await pooledStakingWBTC.numberOfStakingLots().then(x => x.toString())
        
//         const feeRecipient = await pooledStakingETH.FEE_RECIPIENT();
//         this.setState({
//             ethLockedBalance,
//             ethTotalBalance,
//             wbtcLockedBalance,
//             wbtcTotalBalance,
//             feeRecipient,
//             wbtcNumberOfStakingLots,
//             ethNumberOfStakingLots
//         });
//     }

//     render () {
//         return (
//             <div className="App-header">
//                 <h3>Pool Analytics</h3>
//                 <span>Fee recipient is {this.state.feeRecipient}</span>
//                 <span>ETH {this.state.ethLockedBalance}/{this.state.ethTotalBalance}</span>
//                 <span>WBTC {this.state.wbtcLockedBalance}/{this.state.wbtcTotalBalance}</span>
//                 <span>Number of staking lots ETH {this.state.ethNumberOfStakingLots}</span>
//                 <span>Number of staking lots WBTC {this.state.wbtcNumberOfStakingLots}</span>
//             </div>
//         );
//     }
// }

export default StatsTab;