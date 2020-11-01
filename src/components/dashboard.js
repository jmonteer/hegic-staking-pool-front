import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useHegicContract, useWBTCContract, useStakingETHContract, useStakingWBTCContract } from '../contracts/useContract'
import { Container, Row, Col } from 'reactstrap'
import { TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import classnames from 'classnames'

import YourSharesTab from './tabs/yourSharesTab'
import DepositTab from './tabs/depositTab'
import StatsTab from './tabs/statsTab'
import { PoolContext } from '../context/Pool'

function Dashboard() {
  const { account } = useWeb3React()
  const HEGIC = useHegicContract();
  const stakingETH = useStakingETHContract();
  const stakingWBTC = useStakingWBTCContract();
  const WBTC = useWBTCContract();

  const [lots, setLots] = useState([]);
  const [totalBalance, setTotalBalance] = useState(ethers.BigNumber.from('0'))
  const [lockedBalance, setLockedBalance] = useState(ethers.BigNumber.from('0'))

  const balances = {
    totalBalance: {value: totalBalance, setValue: setTotalBalance},
    lockedBalance: {value: lockedBalance, setValue: setLockedBalance}
  }

  const waitAndUpdate = async (txRequest) => {
    console.log(txRequest.hash)
    await txRequest.wait();
  }

  const mintHegic = async () => {
    const amountToMint = ethers.BigNumber.from("300000000000000000000000");
    const txRequest = await HEGIC.mintTo(account, amountToMint);
    await waitAndUpdate(txRequest)
  }

  const mintWBTC = async () => {
    const amountToMint = ethers.BigNumber.from("10000000000");
    const txRequest = await WBTC.mintTo(account, amountToMint);
    const txRequest2 = await WBTC.approve(stakingWBTC.address, amountToMint);
    await waitAndUpdate(txRequest)
    await waitAndUpdate(txRequest2)
  }
  
  const sendProfit = async () => {
    const txRequest = await stakingETH.sendProfit({ value: ethers.utils.parseEther("0.1") })
    await waitAndUpdate(txRequest)
  }

  const sendProfitWBTC = async () => {
    const txRequest = await stakingWBTC.sendProfit(ethers.utils.parseUnits("0.1", 8))
    await waitAndUpdate(txRequest)
  }

  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  return (
    <Container >
      <Row style={{ marginTop: "5vh" }}>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <div>
            <Nav tabs style={{ justifyContent: "center", borderBottom: 0 }}>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '1' })}
                  onClick={() => { toggle('1'); }}
                >
                  Deposit{"&"}Stake
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => { toggle('2'); }}
                >
                  Shares{"&"}Profit
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '3' })}
                  onClick={() => { toggle('3'); }}
                >
                  Stats
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <PoolContext.Provider value={{balances, lots}}>
                <TabPane tabId="1">
                  <DepositTab />
                </TabPane>
                <TabPane tabId="2">
                  <YourSharesTab />
                </TabPane>
                <TabPane tabId="3">
                  <StatsTab />
                </TabPane>
              </PoolContext.Provider>
            </TabContent>
          </div>
        </Col>
      </Row>
      <Row style={{marginBottom:'5vh'}}>
        <Col sm="12" md={{ size: 6, offset: 3 }} style={{display:'flex', justifyContent:'center'}}>
        {/* <Button size="sm" onClick={mintHegic}>Mint 300k HEGIC</Button>
        <Button size="sm" onClick={mintWBTC}>Mint 10 WBTC</Button>
        <Button size="sm" onClick={sendProfit}>Send Profit (0.1ETH)</Button>
        <Button size="sm" onClick={sendProfitWBTC}>Send Profit (0.1WBTC)</Button> */}
        {/* <span><a href="#">About</a></span> */}
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;