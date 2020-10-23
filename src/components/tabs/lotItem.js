import React, {useEffect, useState} from 'react'
import { ethers } from 'ethers'
import { usePooledStakingETHContract } from '../../contracts/useContract';
import { UncontrolledTooltip, Badge, ListGroupItem, ListGroupItemHeading, Progress, Button } from 'reactstrap'

function LotItem(props) {
    const [lotId] = useState(props.lotId);
    const [shares] = useState(props.shares);
    const pooledStakingETH = usePooledStakingETHContract();
    const [numberOfStakingLotsETH, setNumberOfStakingLotsETH] = useState(0);
    const [buttonEnabled, setButtonEnabled] = useState(true);

    useEffect(() => {
        pooledStakingETH.numberOfStakingLots().then((n) => {
            setNumberOfStakingLotsETH(n.toNumber())
        })
    }, [pooledStakingETH])

    const withdrawLot = async (id) => {
        const txReceipt = await pooledStakingETH.exitFromStakingLot(id)
        setButtonEnabled(false);
        await txReceipt.wait()
    }

    let button;
    if((shares > 0 && props.activeButton) || lotId == numberOfStakingLotsETH) 
    button = (
        <Button id="unlocked" style={{
            marginLeft:'10px',
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
            borderImageWidth:'50px'}} size="sm" disabled={!buttonEnabled} onClick={() => withdrawLot(lotId)}>
            WITHDRAW {ethers.utils.commify(ethers.utils.formatEther(shares))} HEGIC
        </Button>
    );
    else if (!props.activeButton && lotId != numberOfStakingLotsETH)
        button = (
            <>
                <Button id="locked" style={{margin:'3px'}} outline disabled size="sm">
                    WITHDRAW {ethers.utils.commify(ethers.utils.formatEther(shares))} HEGIC
                </Button>
                <UncontrolledTooltip placement="bottom" target="locked" >
                    THIS LOT IS LOCKED
                </UncontrolledTooltip>
            </>
        )
    
    const percentage = ethers.BigNumber.from(shares)
                        .div(ethers.BigNumber.from('888000000000000000000')).toNumber()/10;
    
    return (
        <ListGroupItem style={{textAlign:'left', backgroundColor:'transparent', border:'1px solid #223265'}}>
                <ListGroupItemHeading>
                    Lot {lotId} 
                    <Badge pill style={{fontSize:12, marginLeft:"5px"}}>{percentage}%</Badge>
                    {/* { lotId === numberOfStakingLotsETH ? 
                        (<Badge pill style={{fontSize:12, marginLeft:"5px"}} color='warning'>NOT PURCHASED</Badge>)
                        :
                        (null)
                    } */}
                    {button}
                </ListGroupItemHeading>
                    <Progress multi>
                        <Progress bar color="primary" style={{color:'#19274d'}} value={percentage}>You</Progress>
                        { lotId === numberOfStakingLotsETH ? 
                            (<Progress bar color="secondary" value={100-percentage}>Pending</Progress>)
                                : 
                            (<Progress bar color="info" value={100-percentage}>Others</Progress>)
                        }
                    </Progress>
        </ListGroupItem>
    )
}

export default LotItem;