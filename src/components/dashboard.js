import React, { useState } from 'react'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useHegicContract, usePooledStakingETHContract, useStakingETHContract } from '../contracts/useContract'
import { Container, Row, Col } from 'reactstrap'
import { TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import classnames from 'classnames'

import YourLotsTab from './tabs/yourLotsTab'
import DepositTab from './tabs/depositTab'
import StatsTab from './tabs/statsTab'

function Dashboard() {
  const { account } = useWeb3React()
  const HEGIC = useHegicContract();
  const pooledStakingETH = usePooledStakingETHContract();
  const stakingETH = useStakingETHContract();

  const waitAndUpdate = async (txRequest) => {
    console.log(txRequest.hash)
    await txRequest.wait();
  }

  const mintHegic = async () => {
    const amountToMint = ethers.BigNumber.from("300000000000000000000000");
    const txRequest = await HEGIC.mintTo(account, amountToMint);
    await waitAndUpdate(txRequest)
  }

  const allow = async () => {
    const amountToAllow = ethers.BigNumber.from("88700000000000000000000000");
    const txRequest = await HEGIC.approve(pooledStakingETH.address, amountToAllow);
    await waitAndUpdate(txRequest)
  }

  const sendProfit = async () => {
    const txRequest = await stakingETH.sendProfit({ value: ethers.utils.parseEther("0.1") })
    await waitAndUpdate(txRequest)
  }

  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  return (
    <Container>
      <Row style={{ marginTop: "10vh" }}>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <div>
            <Nav tabs style={{ justifyContent: "center", borderBottom: 0 }}>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '1' })}
                  onClick={() => { toggle('1'); }}
                >
                  Deposit {"&"} Stake
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => { toggle('2'); }}
                >
                  Your Staking Lots
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
              <TabPane tabId="1">
                <DepositTab />
              </TabPane>
              <TabPane tabId="2">
                <YourLotsTab />
              </TabPane>
              <TabPane tabId="3">
                <StatsTab />
              </TabPane>
            </TabContent>
          </div>
        </Col>
      </Row>
      <Row>
        <Col  sm="12" md={{ size: 6, offset: 3 }} style={{display:'flex', justifyContent:'center'}}>
        <Button size="sm" onClick={allow}>Allow HEGIC</Button>
        <Button size="sm" onClick={mintHegic}>Mint 300k HEGIC</Button>
        <Button size="sm" onClick={sendProfit}>Send Profit (0.1ETH)</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;