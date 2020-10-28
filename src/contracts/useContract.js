import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { ethers } from 'ethers'

import { abi as STAKING_POOL_ABI } from './json/HegicStakingPool.json'
import { abi as STAKING_ETH_ABI } from './json/FakeHegicStakingETH.json'
import { abi as STAKING_WBTC_ABI } from './json/FakeHegicStakingWBTC.json'
import { abi as HEGIC_ABI } from './json/FakeHEGIC.json'
import { abi as WBTC_ABI } from './json/FakeWBTC.json'

// TEST1 CONTRACTS
// const POOLED_STAKING_ETH_ADDRESS = '0x47B7C230E8624eB598046DB751A7abDE891df95a'
// const POOLED_STAKING_WBTC_ADDRESS = '0xa3ae456c6b1487f1C0dB5592C72eAcD7DC1759fe'
// const STAKING_ETH_ADDRESS = '0xdDEA8F9e69B05C1aAbeeb58d221652A3B92d613C'
// const HEGIC_ADDRESS = '0xaA2A5976a9E9D3d6E4664145F97105881C16c0B9'

// FAKE CONTRACTS
const STAKING_POOL_ADDRESS = '0x0e31323d2b922bf8610aed87cee04a191cd30795'
const STAKING_ETH_ADDRESS = '0xdDEA8F9e69B05C1aAbeeb58d221652A3B92d613C'
const STAKING_WBTC_ADDRESS = '0x54633aCF8aFF9039Fb632393D4194Ba29a825F42'
const HEGIC_ADDRESS = '0xaA2A5976a9E9D3d6E4664145F97105881C16c0B9'
const WBTC_ADDRESS = '0xBDD29c702f0414F19bB5576b46c0811C3A7a7033'
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

export function useStakingPoolContract() {
    return useContract(STAKING_POOL_ADDRESS, STAKING_POOL_ABI);
}

export function useStakingETHContract() {
  return useContract(STAKING_ETH_ADDRESS, STAKING_ETH_ABI);
}

export function useStakingWBTCContract() {
  return useContract(STAKING_WBTC_ADDRESS, STAKING_WBTC_ABI);
}

export function useHegicContract() {
  return useContract(HEGIC_ADDRESS, HEGIC_ABI);
}

export function useWBTCContract() {
  return useContract(WBTC_ADDRESS, WBTC_ABI);
}