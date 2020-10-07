import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect } from 'react'
import { usePooledStakingETHContract } from '../../contracts/useContract';
import LotItem from './lotItem'
import { CardTitle, Row, Col, Card, ListGroup, Button, CardText, Alert } from 'reactstrap'
import { ethers } from 'ethers'

function YourLotsTab () {

    const {account, library, chainId } = useWeb3React();
    const pooledStakingETH = usePooledStakingETHContract();
    const [lotItems, setLotItems] = useState();
    const [profit, setProfit] = useState(ethers.BigNumber.from('0'));
    const [statusMsg, setStatusMsg] = useState('');

    const createlotItems = async () => {
        const numberOfStakingLots = await pooledStakingETH.numberOfStakingLots().then(x => x.toNumber());
        const items = []
        let shares; 

        for(let i = 0; i <= numberOfStakingLots; i++){
            shares = await pooledStakingETH.getStakingLotShares(i, account)
            if(shares > 0)
                items.push(<LotItem key={i} shares={shares.toString()} lotId={i}></LotItem>)
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
        const txRequest = await pooledStakingETH.payProfit({from: account});
        await waitAndUpdate(txRequest)
    }

    useEffect(() => {
        if (!!account && !!library) {
            createlotItems().then((x) => {
                setLotItems(x);
            })
            
            pooledStakingETH.profitOf(account).then(profit => {
                setProfit(profit);
            })
        }
    }, [account, library, chainId]);

    const formatBN = (bn) => {
        return ethers.utils.commify(ethers.utils.formatEther(bn.toString()));
    }

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
                        <CardText>Your profit: {formatBN(profit)} <Button size="sm" onClick={claimProfit}>Claim</Button></CardText>
                        <StatusMsg />
                        <ListGroup style={{maxHeight:"300px", overflow:"scroll", border:"1px solid rgba(0, 0, 0, 0.125)"}}>
                            {lotItems}
                        </ListGroup>
                    </Card>
                </Col>
            </Row> 
        </>
    )
}

export default YourLotsTab;