// import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers'
import React, {useState, useEffect, useContext} from 'react'
import { Row, Col, Card, CardTitle, Alert, CardText, Input, Button, Badge, InputGroup, InputGroupAddon, InputGroupText, Progress} from 'reactstrap'
import { useStakingPoolContract, useHegicContract } from '../../contracts/useContract';
import { formatBN, truncateEtherValue, Asset } from '../../utils'
import { WalletContext } from '../../context/Wallet'

function DepositTab() {
    const wallet = useContext(WalletContext);
    const {account, library, chainId } = wallet.context;

    const HEGIC = useHegicContract();
    const stakingPool = useStakingPoolContract();

    const [statusMsg, setStatusMsg] = useState();
    const [totalBalance, setTotalBalance] = useState(ethers.BigNumber.from('0'));
    const [lockedBalance, setLockedBalance] = useState(ethers.BigNumber.from('0'));
    const [allowanceIsZero, setAllowanceIsZero] = useState(true);

    const [totalNumberOfStakingLots, setTotalNumberOfStakingLots] = useState(0);
    const [numberOfStakingLotsETH, setNumberOfStakingLotsETH] = useState(0);
    const [numberOfStakingLotsWBTC, setNumberOfStakingLotsWBTC] = useState(0);
    
    const [amountToDeposit, setAmountToDeposit] = useState(ethers.BigNumber.from('0'));
    const [depositButtonEnabled, setDepositButtonEnabled] = useState(false);

    useEffect(() => {
        let status = true;
        status = status && (amountToDeposit > 0 || amountToDeposit == '');
        status = status && !allowanceIsZero;     
        if(amountToDeposit != '')  
            status = status && ethers.utils.parseEther(amountToDeposit).lte(wallet.balances.HEGICBalance.value);
        setDepositButtonEnabled(status);
    }, [wallet.balances.HEGICBalance, allowanceIsZero, amountToDeposit])

    useEffect(() => {
        setAllowanceIsZero(wallet.allowances.HEGICAllowance.value.isZero());
    }, [wallet.allowances]);

    useEffect(() => {
        if(!!account && !!library){
            setAmountToDeposit('');

            stakingPool.totalBalance().then(
                (balance) => setTotalBalance(balance)
            );
            stakingPool.lockedBalance().then(
                (balance) => setLockedBalance(balance)
            );
            stakingPool.totalNumberOfStakingLots().then(
                (n) => setTotalNumberOfStakingLots(n.toNumber())
            );
            stakingPool.numberOfStakingLots(Asset.ETH).then(
                (n) => setNumberOfStakingLotsETH(n.toNumber())
            );
            stakingPool.numberOfStakingLots(Asset.WBTC).then(
                (n) => setNumberOfStakingLotsWBTC(n.toNumber())
            );
        }
     }, [wallet.balances]);

    const allow = async () => {
        const amountToAllow = ethers.BigNumber.from("88800000000000000000000000");
        const txRequest = await HEGIC.approve(stakingPool.address, amountToAllow);
        
        await waitAndUpdate(txRequest);
    }

    const waitAndUpdate = async (txRequest) => {
        setStatusMsg( (<a style={{color:'#19274d'}} target='_blank' href={`https://etherscan.io/tx/${txRequest.hash}`}>Pending transaction {txRequest.hash}</a> ) );
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
        
        const txRequest = await stakingPool.deposit(amount);
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

    return (
        <Row>
        <Col sm="12">
            <Card body>
                <CardTitle><h3>Deposit HEGIC</h3></CardTitle>
                <CardText>
                    <Badge color='secondary'>{totalNumberOfStakingLots} Staking Lots Purchased</Badge> <Badge color='primary'>{numberOfStakingLotsETH} ETH Lots</Badge> <Badge color='warning'>{numberOfStakingLotsWBTC} BTC Lots</Badge> <Badge color='secondary'>{truncateEtherValue(formatBN(totalBalance), 3)} HEGIC in pool</Badge>
                    { totalNumberOfStakingLots < 1 ? (
                        <Alert style={{textAlign:'center', margin:'5pt', padding:'5pt', fontSize:'10pt'}}color="warning">
                            If you deposit now, you will have a 50% discount on your fees. FOREVER.
                        </Alert>
                    ) : (
                        totalNumberOfStakingLots < 10 ? (
                            <Alert style={{textAlign:'center', margin:'5pt', padding:'5pt', fontSize:'10pt'}}color="warning">
                                If you deposit now, you will have a 20% discount on your fees. FOREVER.
                            </Alert>
                        ) : (
                            <br/>
                        )
                    )}

                    Deposit your HEGIC in the pool and start earning fees generated by the Hegic Protocol.<br />
                    &nbsp;&nbsp;1. Deposit your HEGIC<br />
                    &nbsp;&nbsp;2. You start earning ETH and WBTC right away. <br />
                    &nbsp;&nbsp;3. Yes, both ETH and WBTC. 🧙‍♂️ Wizardy? 🧙‍♂️<br />
                    &nbsp;&nbsp;4. You can withdraw your HEGIC anytime<sup>*</sup>.
               </CardText>
                    
                <InputGroup style={{marginTop:'15px'}}>
                    <Input placeholder={formatBN(wallet.balances.HEGICBalance.value)} 
                    value={amountToDeposit}
                    onChange={(event) => {
                        setAmountToDeposit(event.target.value)
                    }}/>
                    <InputGroupAddon addonType='append'>
                    <Button className="input-button" onClick={depositMax}>MAX</Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                    <InputGroupText>HEGIC</InputGroupText>
                    </InputGroupAddon>  
                </InputGroup>
                { allowanceIsZero ?
                    (<Button className="main-button" onClick={allow}>APPROVE HEGIC</Button>)
                    :
                    ( null ) 
                }
                <Button className="main-button" disabled={ !depositButtonEnabled ? true : false } onClick={depositHegic}><b>DEPOSIT</b></Button>
                <StatusMsg />
                <div style={{textAlign:'center', lineHeight:'80%'}}>
                    <br></br>
                    <span style={{fontSize:'12px', color:'#667fcc'}}>A performance fee ({wallet.poolConditions.ownerPerformanceFee.value}% of profit) applies.</span> 
                    <br/><span style={{fontSize:'12px', color:'#667fcc'}}><sup>*</sup>If enough liquidity available. 24h period may apply due to Hegic limitations.</span> 
                </div>
            </Card>
        </Col>
      </Row>
    )
}

export default DepositTab;