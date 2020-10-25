// import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers'
import React, {useState, useEffect, useContext} from 'react'
import { UncontrolledTooltip, Row, Col, Card, CardTitle, Alert, CardText, Input, Button, Badge, InputGroup, InputGroupAddon, InputGroupText, Progress} from 'reactstrap'
import { usePooledStakingETHContract, useHegicContract } from '../../contracts/useContract';
import { formatBN, truncateEtherValue } from '../../utils'
import { WalletContext } from '../../context/Wallet'

function DepositTab() {
    // const {account, library, chainId } = useWeb3React();
    const wallet = useContext(WalletContext);
    const {account, library, chainId } = wallet.context;

    const LOT_PRICE = ethers.utils.parseEther('888000');

    const HEGIC = useHegicContract();
    const pooledStakingETH = usePooledStakingETHContract();

    const [numberOfSharesInLastLot, setNumberOfSharesInLastLot] = useState(ethers.BigNumber.from('0'));
    const [statusMsg, setStatusMsg] = useState();
    const [numberOfStakingLots, setNumberOfStakingLots] = useState(ethers.BigNumber.from('0'));
    const [totalBalance, setTotalBalance] = useState(ethers.BigNumber.from('0'));
    const [lockedBalance, setLockedBalance] = useState(ethers.BigNumber.from('0'));
    const [sharesInLastLot, setSharesInLastLot] = useState(ethers.BigNumber.from('0'));
    const [availablePercentage, setAvailablePercentage] = useState(0);
    const [pendingPercentage, setPendingPercentage] = useState(0);
    const [allowanceIsZero, setAllowanceIsZero] = useState(true);

    const [amountToDeposit, setAmountToDeposit] = useState(ethers.BigNumber.from('0'));
    const [depositButtonEnabled, setDepositButtonEnabled] = useState(false);

    useEffect(() => {
        let status = true;
        status = status && (amountToDeposit > 0 || amountToDeposit == '') && amountToDeposit < 888000;
        status = status && !allowanceIsZero;     
        if(amountToDeposit != '')  
            status = status && ethers.utils.parseEther(amountToDeposit).lte(wallet.balances.HEGICBalance.value);
        else 
            status = status && wallet.balances.HEGICBalance.value.lt(LOT_PRICE)
        setDepositButtonEnabled(status);
    }, [wallet.balances.HEGICBalance, allowanceIsZero, amountToDeposit])

    useEffect(() => {
        setAllowanceIsZero(wallet.allowances.HEGICAllowance.value.isZero());
    }, [wallet.allowances]);

    useEffect(() => {
        if(!!account && !!library){
            setAmountToDeposit('');

            pooledStakingETH.totalBalance().then(
                (balance) => setTotalBalance(balance)
                );
            pooledStakingETH.lockedBalance().then(
                (balance) => setLockedBalance(balance)
                );
            pooledStakingETH.numberOfStakingLots().then(
                n => {
                    setNumberOfStakingLots(n)
                    const STAKING_LOT_PRICE_DIV_100 = ethers.BigNumber.from('8880000000000000000000'); // divided by 100
                    pooledStakingETH.getStakingLotShares(n, account)
                    .then(shares => {
                        setNumberOfSharesInLastLot(shares);
                        setSharesInLastLot(shares.div(STAKING_LOT_PRICE_DIV_100).toNumber())
                        });
                });
        }
     }, [wallet.balances]);

    useEffect(() => {
        if(!totalBalance.isZero()){
            const availablePercentage = totalBalance.sub(lockedBalance).mul(ethers.BigNumber.from('100')).div(ethers.utils.parseEther('888000')).toNumber();
            const pendingPercentage = 100 - availablePercentage;

            setAvailablePercentage(availablePercentage);
            setPendingPercentage(pendingPercentage);
        }
    }, [wallet.balances, totalBalance, lockedBalance, numberOfStakingLots, sharesInLastLot])

    const allow = async () => {
        const amountToAllow = ethers.BigNumber.from("88800000000000000000000000");
        const txRequest = await HEGIC.approve(pooledStakingETH.address, amountToAllow);
        
        await waitAndUpdate(txRequest);
    }

    const waitAndUpdate = async (txRequest) => {
        setStatusMsg( (<a style={{color:'#19274d'}} target='_blank' href={`https://rinkeby.etherscan.io/tx/${txRequest.hash}`}>Pending transaction {txRequest.hash}</a> ) );
        await txRequest.wait();
        setStatusMsg("");
    }

    const depositMax = () => {
        setAmountToDeposit(ethers.utils.formatEther(wallet.balances.HEGICBalance.value));
    }

    const depositHegic = async () => {
        let amount;
        if(amountToDeposit == '') 
            amount = wallet.balances.HEGICBalance.value
        else 
            amount = ethers.utils.parseEther(amountToDeposit); 
        
        const txRequest = await pooledStakingETH.deposit(amount);
        setAmountToDeposit(0);
        await waitAndUpdate(txRequest);
    }

    const StatusMsg = () => {
        return (
            <>
            { statusMsg ? (
                <Alert color="primary" style={{marginTop:'10px'}}>
                    {statusMsg}
                </Alert> 
            ) : null }
            </>
        );
    }

    const tooltipsJSX = (<>
        <UncontrolledTooltip placement="bottom" target="progress-others" >
            Others: {formatBN(totalBalance.sub(lockedBalance).sub(wallet.balances.sHEGICBalance.value))} HEGIC
        </UncontrolledTooltip>
        <UncontrolledTooltip placement="bottom" target="progress-pending" >
            Pending: {formatBN(ethers.utils.parseEther('888000').sub(totalBalance.sub(lockedBalance)))} HEGIC
        </UncontrolledTooltip>
      </>);

    return (
        <Row>
        <Col sm="12">
            <Card body>
                <CardTitle><h3>Deposit HEGIC</h3></CardTitle>

                <CardText>
                    <Badge color="primary">You have {truncateEtherValue(formatBN(wallet.balances.sHEGICBalance.value),2)} sHEGIC</Badge>
                </CardText>

                <CardText>
                    Deposit your HEGIC in the pool and start earning fees generated by the Hegic Protocol.<br />
                    1. Deposit your HEGIC<br />
                    2. When the deposited amount reaches the Staking Lot Price, the contract will buy a Hegic Staking Lot<br />
                    3. Earn Hegic Protocol fees <br />
               </CardText>
                    <>
                        <h5>Next Lot (#{numberOfStakingLots.toString()})</h5> 
                        <Badge style={{marginBottom:'5px'}}>{ formatBN(ethers.utils.parseEther('888000').sub(totalBalance.sub(lockedBalance)).toString())} HEGIC until next Staking Lot purchase</Badge>
                        { totalBalance.toString() == '0' ? null : (
                        <>
                            { sharesInLastLot.toString() == '0' ? (
                                <>
                                <Progress multi>
                                    <Progress bar id='progress-others' style={{color:'#19274d'}} color="warning" value={availablePercentage}>Others</Progress>
                                    <Progress bar animated id='progress-pending' color="secondary" value={pendingPercentage}>Pending</Progress>
                                </Progress>
                                {tooltipsJSX}
                                </>
                            ) : (<>
                                <Progress multi>
                                    <Progress bar id='progress-others' style={{color:'#19274d'}} color="warning" value={availablePercentage-sharesInLastLot}>Others</Progress>
                                    <Progress bar id='progress-you' style={{color:'#19274d'}} color="primary" value={sharesInLastLot}>You</Progress>
                                    <Progress bar animated id='progress-pending' color="secondary" value={pendingPercentage}>Pending</Progress>
                                </Progress>
                                {tooltipsJSX}
                                <UncontrolledTooltip placement="bottom" target="progress-you" >
                                    You: {formatBN(numberOfSharesInLastLot)} HEGIC
                                </UncontrolledTooltip>
                            </>
                            )}
                        </>
                        )}
                    </>
                <InputGroup style={{marginTop:'15px'}}>
                    <Input placeholder={formatBN(wallet.balances.HEGICBalance.value)} 
                    value={amountToDeposit}
                    onChange={(event) => {
                        setAmountToDeposit(event.target.value)
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
                        borderImageWidth:'50px'}} onClick={depositMax}>MAX</Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                    <InputGroupText>HEGIC</InputGroupText>
                    </InputGroupAddon>  
                </InputGroup>
                { allowanceIsZero ?
                    (<Button style={{
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
                        borderImageWidth:'50px'}} onClick={allow}>APPROVE HEGIC</Button>)
                    :
                    ( null ) 
                }
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
                        borderImageWidth:'50px'}} disabled={ !depositButtonEnabled ? true : false } onClick={depositHegic}><b>DEPOSIT</b></Button>
                <StatusMsg />
                <div style={{textAlign:'center', lineHeight:'75%'}}>
                    <br></br>
                    <span style={{fontSize:'12px', color:'#667fcc'}}>A performance fee (10% of profit) applies.</span> 
                    <br/><span style={{fontSize:'12px', color:'#667fcc'}}>You can withdraw your unused funds for free anytime. If a lot is purchased, you will have to wait 2 weeks.</span> 
                </div>
            </Card>
        </Col>
      </Row>
    )
}

export default DepositTab;