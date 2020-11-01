// import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useContext } from 'react'
import { useStakingPoolContract } from '../../contracts/useContract';
import { CardTitle, Row, Badge, Col, Card, Input, InputGroup, InputGroupAddon, InputGroupText, Button, CardText, Alert } from 'reactstrap'
import { ethers } from 'ethers'
import { truncateEtherValue, formatBN, Asset } from '../../utils'
import { WalletContext } from '../../context/Wallet'

function YourSharesTab () {
    // const {account, library, chainId } = useWeb3React();
    const wallet = useContext(WalletContext);
    const {account, library, chainId } = wallet.context;

    const stakingPool = useStakingPoolContract();

    const [profitETH, setProfitETH] = useState(ethers.BigNumber.from('0'));
    const [profitWBTC, setProfitWBTC] = useState(ethers.BigNumber.from('0'));
    const [statusMsg, setStatusMsg] = useState('');
    const [claimButtonDisabled, setClaimButtonDisabled] = useState(false);
    const [amountToWithdraw, setAmountToWithdraw] = useState('');
    const [withdrawButtonEnabled, setWithdrawButtonEnabled] = useState(false);
    const [statusType, setStatusType] = useState('primary');
    
    useEffect(() => {
        let status = true;
        status = status && (amountToWithdraw > 0 || amountToWithdraw == '');
        if(amountToWithdraw != '')  
            status = status && ethers.utils.parseEther(amountToWithdraw).lte(wallet.balances.sHEGICBalance.value);
        setWithdrawButtonEnabled(status);
    }, [wallet.balances.sHEGICBalance, amountToWithdraw])

    const waitAndUpdate = async (txRequest) => {
        setStatusType("primary");
        setStatusMsg( (<a style={{color:'#19274d'}} target='_blank' href={`https://etherscan.io/tx/${txRequest.hash}`}>Pending transaction {txRequest.hash}</a> ) );
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
                setClaimButtonDisabled(true);

                stakingPool.profitOf(account, Asset.WBTC).then(profit => {
                    setProfitWBTC(profit);
                    if(!profit.isZero())
                        setClaimButtonDisabled(false);
                })
                setProfitETH(profit);
                if(!profit.isZero())
                    setClaimButtonDisabled(false);
            })
        }
    }, [wallet.balances]);

    const withdrawHegic = async () => {
        let amount;
        if(amountToWithdraw == '') 
            amount = wallet.balances.sHEGICBalance.value
        else 
            amount = ethers.utils.parseEther(amountToWithdraw); 
        
        try {
            const txRequest = await stakingPool.withdraw(amount);
            setAmountToWithdraw(0);
            await waitAndUpdate(txRequest);
        } catch (error) {
            setStatusType("danger");
            setStatusMsg("Ups something went wrong.");
            if(await stakingPool.canWithdraw(account).then(x => !x))
                setStatusMsg("You deposited less than 15 mins ago. Your funds are still locked");
            else
                setStatusMsg("Ups! Something went wrong. Are you withdrawing more funds than available?")
        }
    }

    const claimProfitAndWithdrawAll = async () => {
        try {
            const txRequest = await stakingPool.claimProfitAndWithdraw();
            setAmountToWithdraw(0);
            await waitAndUpdate(txRequest);
        } catch (error) {
            setStatusType("danger");
            setStatusMsg("Ups something went wrong.");
            if(await stakingPool.canWithdraw(account).then(x => !x))
                setStatusMsg("You deposited less than 15 mins ago. Your funds are still locked");
            else
                setStatusMsg("Ups! Something went wrong. Are you withdrawing more funds than available?")
        }
    }
    
    const withdrawMax = () => {
        setAmountToWithdraw(ethers.utils.formatEther(wallet.balances.sHEGICBalance.value));
    }

    const StatusMsg = () => {
        return (
            <>
            <br />
            { statusMsg ? (
                <Alert color={statusType}>
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
                                        {truncateEtherValue(ethers.utils.commify(ethers.utils.formatUnits(profitWBTC, 8)), 4)} WBTC
                                        <br /> 
                                </div>
                            </div>
                                <Button className="main-button" style={{marginTop:'5px'}} disabled={claimButtonDisabled} onClick={claimProfit}>
                                        CLAIM PROFIT
                                    </Button>
                                    <span style={{fontSize:'12px', color:'#667fcc'}}>A performance fee ({wallet.poolConditions.ownerPerformanceFee.value}% of profit) applies.</span>                             
                            </div>
                            <StatusMsg />
                            <br />
                            <h5>Your share <Badge color="primary" style={{fontSize:'9pt'}}>You have {truncateEtherValue(formatBN(wallet.balances.sHEGICBalance.value),2)} sHEGIC</Badge></h5>                    

                            <InputGroup>
                            <Input placeholder={formatBN(wallet.balances.sHEGICBalance.value)} 
                            value={amountToWithdraw}
                            onChange={(event) => {
                                setAmountToWithdraw(event.target.value)
                            }}/>
                            <InputGroupAddon addonType='append'>
                            <Button className="input-button" onClick={withdrawMax}>MAX</Button>
                            </InputGroupAddon>
                            <InputGroupAddon addonType="append">
                            <InputGroupText>HEGIC</InputGroupText>
                            </InputGroupAddon>  
                        </InputGroup>
                        <Button className="main-button" disabled={ !withdrawButtonEnabled ? true : false } onClick={withdrawHegic}>
                                    <b>WITHDRAW</b>
                        </Button>
                        <Button className="main-button" onClick={claimProfitAndWithdrawAll}>
                                    <b>CLAIM PROFIT AND WITHDRAW ALL</b>
                        </Button>
                    </Card>
                </Col>
            </Row> 
        </>
    )
}

export default YourSharesTab;