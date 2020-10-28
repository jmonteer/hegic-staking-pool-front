// import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useContext } from 'react'
import { useStakingPoolContract } from '../../contracts/useContract';
import { CardTitle, Row, Badge, Col, Card, Input, InputGroup, InputGroupAddon, InputGroupText, Button, CardText, Alert } from 'reactstrap'
import { ethers } from 'ethers'
import { truncateEtherValue, formatBN } from '../../utils'
import { WalletContext } from '../../context/Wallet'

function YourSharesTab () {
    // const {account, library, chainId } = useWeb3React();
    const wallet = useContext(WalletContext);
    const {account, library, chainId } = wallet.context;

    const stakingPool = useStakingPoolContract();
    const LOT_PRICE = ethers.utils.parseEther('888000');
    const Asset = {WBTC: 0, ETH: 1}
    const [profitETH, setProfitETH] = useState(ethers.BigNumber.from('0'));
    const [profitWBTC, setProfitWBTC] = useState(ethers.BigNumber.from('0'));
    const [statusMsg, setStatusMsg] = useState('');
    const [claimButtonDisabled, setClaimButtonDisabled] = useState(false);
    const [amountToWithdraw, setAmountToWithdraw] = useState('');
    const [withdrawButtonEnabled, setWithdrawButtonEnabled] = useState(false);

    useEffect(() => {
        let status = true;
        status = status && (amountToWithdraw > 0 || amountToWithdraw == '') && amountToWithdraw < 888000;
        if(amountToWithdraw != '')  
            status = status && ethers.utils.parseEther(amountToWithdraw).lte(wallet.balances.sHEGICBalance.value);
        else 
            status = status && wallet.balances.sHEGICBalance.value.lt(LOT_PRICE)
        setWithdrawButtonEnabled(status);
    }, [wallet.balances.sHEGICBalance, amountToWithdraw])

    const waitAndUpdate = async (txRequest) => {
        setStatusMsg( (<a style={{color:'#19274d'}} target='_blank' href={`https://rinkeby.etherscan.io/tx/${txRequest.hash}`}>Pending transaction {txRequest.hash}</a> ) );
        await txRequest.wait();
        setStatusMsg("");
    }

    const claimProfit = async () => {
        const txRequest = await stakingPool.claimAllProfit({from: account});
        setClaimButtonDisabled(true);
        await waitAndUpdate(txRequest)
    }

    useEffect(() => {
        if (!!account && !!library) {
            stakingPool.profitOf(account, Asset.ETH).then(profit => {
                setProfitETH(profit);
                if(profit.isZero())
                    setClaimButtonDisabled(true);
            })
            stakingPool.profitOf(account, Asset.WBTC).then(profit => {
                setProfitWBTC(profit);
                if(profit.isZero())
                    setClaimButtonDisabled(true);
            })
        }
    }, [wallet.balances]);

    const withdrawHegic = async () => {
        let amount;
        if(amountToWithdraw == '') 
            amount = wallet.balances.sHEGICBalance.value
        else 
            amount = ethers.utils.parseEther(amountToWithdraw); 
        console.log(amount.toString());
        const txRequest = await stakingPool.withdraw(amount);
        setAmountToWithdraw(0);
        await waitAndUpdate(txRequest);
    }

    const withdrawMax = () => {
        setAmountToWithdraw(ethers.utils.formatEther(wallet.balances.sHEGICBalance.value));
    }

    const StatusMsg = () => {
        return (
            <>
            <br />
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
                        <CardTitle><h3>Your Shares & Profit</h3></CardTitle>
                        <h5>Your Profit</h5>
                        <div style={{
                            display:'flex',
                            flexDirection:'column',
                            textAlign:'center'}}>
                            <div style={{
                                    width:'100%',
                                    display: 'flex',
                                    flexDirection:'row',
                                    textAlign:'center'
                                }}>
                                <div className="profit-info-box eth">
                                        <b>Your ETH profit:</b>
                                        {truncateEtherValue(formatBN(profitETH), 4)} ETH
                                        <br /> 
                                </div>
                                <div className="profit-info-box wbtc">
                                        <b>Your WBTC profit:</b>
                                        {truncateEtherValue(ethers.utils.commify(ethers.utils.formatUnits(profitWBTC, 8)), 4)} ETH
                                        <br /> 
                                </div>
                            </div>
                                <Button style={{
                                    marginTop:'5px',
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
                                    <span style={{fontSize:'12px', color:'#667fcc'}}>A performance fee (5% of profit) applies.</span>                             
                            </div>
                            <StatusMsg />
                            <br />
                            <h5>Your share  <Badge color="primary" style={{fontSize:'9pt'}}>You have {truncateEtherValue(formatBN(wallet.balances.sHEGICBalance.value),2)} sHEGIC</Badge></h5>                    

                            <InputGroup>
                            <Input placeholder={formatBN(wallet.balances.sHEGICBalance.value)} 
                            value={amountToWithdraw}
                            onChange={(event) => {
                                setAmountToWithdraw(event.target.value)
                            }}/>
                            <InputGroupAddon addonType='append'>
                            <Button style={{
                                fontWeight:'bold',
                                fontFamily:'Jura',
                                letterSpacing:'.1em',
                                background:'transparent',
                                borderColor:'#45fff4',
                                borderImageSlice:'20',
                                borderStyle:'solid',
                                boxSizing:'border-box',
                                borderRadius:'2px',
                                borderImageWidth:'50px'}} onClick={withdrawMax}>MAX</Button>
                            </InputGroupAddon>
                            <InputGroupAddon addonType="append">
                            <InputGroupText>HEGIC</InputGroupText>
                            </InputGroupAddon>  
                        </InputGroup>
                        <Button style={{
                                marginTop:'10px',
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
                                borderImageWidth:'50px'}} disabled={ !withdrawButtonEnabled ? true : false } onClick={withdrawHegic}>
                                    <b>WITHDRAW</b>
                                </Button>
                        <Button style={{
                                marginTop:'10px',
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
                                borderImageWidth:'50px'}} onClick={withdrawHegic}>
                                    <b>CLAIM PROFIT AND WITHDRAW ALL</b>
                                </Button>
                    </Card>
                </Col>
            </Row> 
        </>
    )
}

export default YourSharesTab;