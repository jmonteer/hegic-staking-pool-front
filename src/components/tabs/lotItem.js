import React, {useEffect, useState} from 'react'
import { ethers } from 'ethers'
import { usePooledStakingETHContract } from '../../contracts/useContract';
import { Badge, ListGroupItem, ListGroupItemHeading, Progress, Button } from 'reactstrap'

function LotItem(props) {
    const [lotId] = useState(props.lotId);
    const [shares] = useState(props.shares);
    const pooledStakingETH = usePooledStakingETHContract();
    const [numberOfStakingLotsETH, setNumberOfStakingLotsETH] = useState(0);

    useEffect(() => {
        pooledStakingETH.numberOfStakingLots().then((n) => {
            setNumberOfStakingLotsETH(n.toNumber())
        })
    }, [pooledStakingETH])

    

    const withdrawLot = async (id) => {
        const txReceipt = await pooledStakingETH.exitFromStakingLot(id)
        console.log("Pending", txReceipt.hash)
        await txReceipt.wait()
        console.log("Done ", txReceipt.hash)
    }

    let button;
        if(shares > 0) 
        button = (
            <Button style={{margin:'3px'}} size="sm" onClick={() => withdrawLot(lotId)}>
                Withdraw {ethers.utils.commify(ethers.utils.formatEther(shares))} HEGIC
            </Button>
        );
        else
            button = (
                <Button style={{margin:'3px'}} outline disabled size="sm">
                    No HEGIC staked in lot
                </Button>
            )
        
        const percentage = ethers.BigNumber.from(shares)
                            .div(ethers.BigNumber.from('888000000000000000000')).toNumber()/10;
        return (
            <ListGroupItem style={{backgroundColor:'transparent', border:'1px solid #223265'}}>
                    <ListGroupItemHeading>Lot {lotId} <Badge pill style={{fontSize:12}}>{percentage}%</Badge>{button}</ListGroupItemHeading>
                        <Progress multi>
                            <Progress bar color="warning" value={percentage}>You</Progress>
                            { lotId === numberOfStakingLotsETH ? 
                                (<Progress bar color="secondary" value={100-percentage}></Progress>)
                                 : 
                                (<Progress bar color="info" value={100-percentage}>Others</Progress>)
                            }
                        </Progress>
            </ListGroupItem>
        )
    }

export default LotItem;