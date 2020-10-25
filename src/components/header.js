import React, { useState, useEffect, useContext } from 'react'
// import { useWeb3React } from '@web3-react/core'
import { useHegicContract, usePooledStakingETHContract } from '../contracts/useContract'
import { ethers } from 'ethers';
import { Badge, Button, Col, Navbar} from 'reactstrap';
import { hexZeroPad } from 'ethers/lib/utils';
import { truncateAddress, truncateEtherValue, formatBN } from '../utils'
import { WalletContext } from '../context/Wallet'

function Header(props) {
    // const { account, library, chainId, active } = useWeb3React();
    const wallet = useContext(WalletContext);
    const { account, library, chainId, active } = wallet.context;

    const HEGIC = useHegicContract();
    const pooledStakingETH = usePooledStakingETHContract();

    useEffect(() => {
        if(!!account && !!library) {
            library.getBalance(account).then((balance) => {
                wallet.balances.ETHBalance.setValue(balance)
            });

            pooledStakingETH.balanceOf(account).then((balance) => {
                wallet.balances.sHEGICBalance.setValue(balance)
            });

            HEGIC.balanceOf(account).then((balance) => {
                wallet.balances.HEGICBalance.setValue(balance)
            });

            HEGIC.allowance(account, pooledStakingETH.address).then((allowance) => {
                wallet.allowances.HEGICAllowance.setValue(allowance);
            });

            const filter_inputs = {
                address: HEGIC.address,
                topics: [
                    ethers.utils.id("Transfer(address,address,uint256)"),
                    null,
                    hexZeroPad(account,32)
                ]
            }

            const filter_outputs = {
                address: HEGIC.address,
                topics: [
                    ethers.utils.id("Transfer(address,address,uint256)"),
                    hexZeroPad(account,32)
                ]
            }
            
            const filter_approve = {
                address: HEGIC.address,
                topics: [
                    ethers.utils.id("Approval(address,address,uint256)"),
                    hexZeroPad(account,32)
                ]
            }

            const filter_profit = {
                address: HEGIC.address,
                topics: [
                    ethers.utils.id("PayProfit(address,uint256)"),
                    hexZeroPad(account,32)
                ]
            }

            library.on(filter_inputs, (log, event) => {
                HEGIC.balanceOf(account).then((balance) => {
                    wallet.balances.HEGICBalance.setValue(balance)
                });
                pooledStakingETH.balanceOf(account).then((balance) => {
                    wallet.balances.sHEGICBalance.setValue(balance)
                });
            });

            library.on(filter_profit, (log, event) => {
                library.getBalance(account).then((balance) => {
                    wallet.balances.ETHBalance.setValue(balance)
                });
                // UPDATE PROFIT
            });

            library.on(filter_outputs, (log, event) => {
                HEGIC.balanceOf(account).then((balance) => {
                    wallet.balances.HEGICBalance.setValue(balance)
                });
                pooledStakingETH.balanceOf(account).then((balance) => {
                    wallet.balances.sHEGICBalance.setValue(balance)
                });
            });

            library.on(filter_approve, (log, event) => {
                HEGIC.allowance(account, pooledStakingETH.address).then((allowance) => {
                    wallet.allowances.HEGICAllowance.setValue(allowance);
                });
            });
        }
            

    }, [account, library, chainId])

    const Wallet = () => {
        return (
            <>
                <Col sm='0' md={{size:2, offset:5}} style={{display:'flex', justifyContent:'center'}}>
                    <h3 style={{color:'#45fff4', zIndex:'99', fontFamily:'Jura', fontWeight:'bold'}}>HEGIC</h3>
                </Col>
                <Col sm='12' md={{size:5, offset:0}} style={{display:'flex', justifyContent:'flex-end'}}>
                { active ? (
                    <div>
                        <Badge color="primary" style={{margin:"2.5px"}}>{truncateEtherValue(formatBN(wallet.balances.HEGICBalance.value),2)} HEGIC </Badge>
                        <Badge color="secondary" style={{margin:"2.5px"}}>{truncateEtherValue(formatBN(wallet.balances.ETHBalance.value),4)} ETH </Badge>
                        <span style={{color:'#defefe', fontSize:'12px'}}>{truncateAddress(account)}</span>
                        <Button color="link" onClick={wallet.disconnect}>Disconnect</Button>
                    </div>
                ) : (
                    <Button color="link" onClick={wallet.connect}>Connect</Button>
                )}
                </Col>
            </>
        )
    }
    
    return (
            <Navbar style={{display:'flex', backgroundColor:'#19274d', borderBottom: '1px solid #45fff4'}}>
                <Wallet />
            </Navbar>
    );
}

export default Header;