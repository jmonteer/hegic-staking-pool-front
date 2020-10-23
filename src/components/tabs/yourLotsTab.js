// import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useContext } from 'react'
import { usePooledStakingETHContract } from '../../contracts/useContract';
import LotItem from './lotItem'
import { CardTitle, Row, Col, Card, ListGroup, Button, CardText, Alert } from 'reactstrap'
import { ethers } from 'ethers'
import { truncateEtherValue, formatBN } from '../../utils'
import { PoolContext } from '../../context/Pool'
import { WalletContext } from '../../context/Wallet'

function YourLotsTab () {
    // const {account, library, chainId } = useWeb3React();
    const wallet = useContext(WalletContext);
    const {account, library, chainId } = wallet.context;

    const pooledStakingETH = usePooledStakingETHContract();

    const [lotItems, setLotItems] = useState();
    const [profit, setProfit] = useState(ethers.BigNumber.from('0'));
    const [statusMsg, setStatusMsg] = useState('');
    const [claimButtonDisabled, setClaimButtonDisabled] = useState(false);
    
    const createlotItems = async () => {
        const numberOfStakingLots = await pooledStakingETH.numberOfStakingLots().then(x => x.toNumber());
        const items = []
        let shares; 
        let isInLockUpPeriod;
        if(wallet.balances.sHEGICBalance.value.isZero()) 
            return (
                <span>You have not staked your HEGIC yet. <br /> Go to "Deposit&Stake" tab and deposit HEGIC.</span>
            );
        const sharesInNextStakingLot = await pooledStakingETH.getStakingLotShares(numberOfStakingLots, account);
        for(let i = 0; i <= numberOfStakingLots; i++){
            shares = await pooledStakingETH.getStakingLotShares(i, account)
            isInLockUpPeriod = await pooledStakingETH.isInLockUpPeriod(i);
            if(shares > 0)
                items.push(<LotItem key={i} shares={shares.toString()} lotId={i} activeButton={sharesInNextStakingLot==0 && !isInLockUpPeriod}></LotItem>)
        }

        return items
    }

    const waitAndUpdate = async (txRequest) => {
        console.log(txRequest.hash)
        setStatusMsg("Pending " + txRequest.hash);
        await txRequest.wait();
        setStatusMsg("");
    }

    const claimProfit = async () => {
        const txRequest = await pooledStakingETH.claimProfit({from: account});
        setClaimButtonDisabled(true);
        await waitAndUpdate(txRequest)
    }

    useEffect(() => {
        if (!!account && !!library) {
            createlotItems().then((x) => {
                setLotItems(x);
            })
            
            pooledStakingETH.profitOf(account).then(profit => {
                setProfit(profit);
                if(profit.isZero())
                    setClaimButtonDisabled(true);
            })
        }
    }, [wallet.balances]);

    const StatusMsg = () => {
        return (
            <>
            { statusMsg ? (
                <Alert color="primary">
                    {statusMsg}
                </Alert> 
            ) : null }
            </>
        );
    }

    return (
        <>
            <Row>
                <Col sm="12">
                    <Card body >
                        <CardTitle><h3>Your Staking Lots</h3></CardTitle>
                        <CardText>
                            In this tab you will see all the lots in which you have shares. 
                            <br />
                            Before you exit any lot, you have to withdraw unstaked funds. Also, after a Staking Lot is bought, you have to wait 24 hours to withdraw. 
                            <br />
                        </CardText>
                            <div style={{
                            display:'flex',
                            flexDirection:'column',
                            justifyContent:'center',
                            textAlign:'center'
                            }}>
                                <b>Your profit:</b>
                                {truncateEtherValue(formatBN(profit), 4)} ETH
                                <br /> 
                                <Button size="sm" style={{
                                width: 'auto',
                                color:'#15203d',
                                fontWeight:'bold',
                                fontFamily:'Jura',
                                letterSpacing:'.1em',
                                background:'transparent',
                                borderImageSource:'url(https://www.hegic.co/assets/img/button-primary.svg)', 
                                borderImageSlice:'20',
                                borderStyle:'solid',
                                boxSizing:'border-box',
                                borderRadius:'2px',
                                borderImageWidth:'50px'}} disabled={claimButtonDisabled} onClick={claimProfit}>
                                    CLAIM PROFIT
                                </Button>
                                <span style={{fontSize:'12px', color:'#667fcc'}}>A performance fee (10% of profit) applies.</span> 
                            </div>
                            <br />
                            <StatusMsg />
                        <ListGroup style={{textAlign:'center', maxHeight:"300px", overflow:"scroll", overflowX:'hidden', border:"1px solid rgba(0, 0, 0, 0.125)"}}>
                            {lotItems}
                        </ListGroup>
                    </Card>
                </Col>
            </Row> 
        </>
    )
}

export default YourLotsTab;