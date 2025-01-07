import abi from './abi.json'
import cross_abi from './cross_abi.json'
import pre_staking_abi from './pre_staking_abi.json'
const config = {
    erc20_abi: abi,
    cross_abi: cross_abi,
    pre_staking_abi: pre_staking_abi,
    pre_staking_addr: '0xC8053fe058AE506C8429F14D53216eCdD6867B3D',
    con_addr: '0x00000000000000000000000000000000000000A1',
    unit: 'Gwei',
    amount: '10',
    chainId: '0x329',
    // chainId: '0x11623',
    chainName: 'Hash Ahead Mainnet',
    rpcUrls: 'https://rpc.hashahead.org',
    // rpcUrls: 'https://rpc-testnet.hashahead.org/mrpc',
    blockExplorerUrls: 'https://scan.hashahead.org/',
}

export { config }
