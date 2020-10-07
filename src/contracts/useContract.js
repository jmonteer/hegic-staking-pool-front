import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { ethers } from 'ethers'

import { abi as POOLED_STAKING_ETH_ABI } from './json/HegicPooledStakingETH.json'
import { abi as POOLED_STAKING_WBTC_ABI } from './json/HegicPooledStakingWBTC.json'
import { abi as STAKING_ETH_ABI } from './json/FakeHegicStakingETH.json'
import { abi as HEGIC_ABI } from './json/FakeHEGIC.json'

const POOLED_STAKING_ETH_ADDRESS = '0x72b12b5AaC48FB1CB64f64Ab5c0e1E18F36abCe6'
const POOLED_STAKING_WBTC_ADDRESS = '0x0a4fa96d217C7BeC89909232e5934733e54C6Be5'
const STAKING_ETH_ADDRESS = '0xd05f7b1798c96013699D52b13286DeC326f971a7'
const HEGIC_ADDRESS = '0xc39Bd82C93F6B91dd391c72425403c599375FfF9'

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