import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { ethers } from 'ethers'

import { abi as POOLED_STAKING_ETH_ABI } from './json/HegicPooledStakingETH.json'
import { abi as POOLED_STAKING_WBTC_ABI } from './json/HegicPooledStakingWBTC.json'
import { abi as STAKING_ETH_ABI } from './json/FakeHegicStakingETH.json'
import { abi as HEGIC_ABI } from './json/FakeHEGIC.json'

// TEST1 CONTRACTS
// const POOLED_STAKING_ETH_ADDRESS = '0x47B7C230E8624eB598046DB751A7abDE891df95a'
// const POOLED_STAKING_WBTC_ADDRESS = '0xa3ae456c6b1487f1C0dB5592C72eAcD7DC1759fe'
// const STAKING_ETH_ADDRESS = '0xdDEA8F9e69B05C1aAbeeb58d221652A3B92d613C'
// const HEGIC_ADDRESS = '0xaA2A5976a9E9D3d6E4664145F97105881C16c0B9'

// FAKE CONTRACTS
const POOLED_STAKING_ETH_ADDRESS = '0x6C97e94B7571834693D5c311aEF834084FaDCc3A'
const POOLED_STAKING_WBTC_ADDRESS = '0x2e7Fc37Fc94e16BBFeABd65B94506BCA93136e3c'
const STAKING_ETH_ADDRESS = '0xd43e382B9b931a6fE49a62aC9f1374E4d84d974d'
const HEGIC_ADDRESS = '0xaA2A5976a9E9D3d6E4664145F97105881C16c0B9'

// returns null on errors
function getContract(address, ABI, library, account) {
    return new ethers.Contract(address, ABI, library.getSigner(account))
}

function useContract(address, ABI, withSignerIfPossible = true) {
    const { library, account } = useWeb3React()
  
    return useMemo(() => {
      if (!address || !ABI || !library) return null
      try {
        return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    }, [address, ABI, library, withSignerIfPossible, account])
  } 

  export function usePooledStakingETHContract() {
    return useContract(POOLED_STAKING_ETH_ADDRESS, POOLED_STAKING_ETH_ABI);
}

export function usePooledStakingWBTCContract() {
    return useContract(POOLED_STAKING_WBTC_ADDRESS, POOLED_STAKING_WBTC_ABI);
}

export function useStakingETHContract() {
    return useContract(STAKING_ETH_ADDRESS, STAKING_ETH_ABI);
}

export function useHegicContract() {
    return useContract(HEGIC_ADDRESS, HEGIC_ABI);
}