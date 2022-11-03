import BaseNetwork, { Synth, WalletPrimaryData } from "@/networks/base";
import { ConnectButton, useAccount, useBalance, useContractRead, Web3Modal, useToken } from "@web3modal/react";
import { ReactNode } from "react";
import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import { chains } from "@web3modal/ethereum";


const SynergyAddress: string = "0xe3C9A0cd80155f30B805e161d9A01aC5516EF1bF";

const walletConnectConfig = {
    projectId: "12647116f49027a9b16f4c0598eb6d74",
    theme: "dark",
    accentColor: "default",
    ethereum: {
        appName: 'web3Modal',
        autoConnect: true
    }
};

const AvailableSynth: Synth[] = [
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        full_name: "Gold",
        symbol: "GOLD",
        trading_view_symbol: "GOLD"
    },
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        full_name: "Silver",
        symbol: "SILVER",
        trading_view_symbol: "SILVER"
    }
]

const RusdAddress: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

class EthereumNetwork extends BaseNetwork {
    connectButton(): ReactNode {
        return (
            <>
                <Web3Modal config={walletConnectConfig} />
                <div id="ethereum-connect-button" style={{color: "white"}}>
                    <ConnectButton />
                </div>
            </>

        );
    }
    showWallet(): WalletPrimaryData | null {

        const { account } = useAccount();
        const { data, error, isLoading, refetch } = useBalance({
            addressOrName: account.address
        })
        if (account.isConnected == false) {
            return null;
        }
        if (data === undefined) {
            return null;
        }

        const wallet: WalletPrimaryData = {
            address: account.address,
            network_currency_symbol: "ETH",
            network_currency_amount: data.formatted
        };
        return wallet
    }

    getRusdBalance(): number | undefined {

        const { account, isReady } = useAccount();
        console.log(account.address)
        console.log(chains.goerli.id)
        const synergyCallResult = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "rUsd",
            chainId: chains.goerli.id
        });
        console.log(synergyCallResult);

        if (typeof synergyCallResult.data == "string") {
            const rusdContract = useToken({
                address: synergyCallResult.data
            })
            const rusdBalanceOfCall = useContractRead({
                address: synergyCallResult.data ,
                abi: RusdABI,
                functionName: "balanceOf",
                args: [account.address],
                chainId: chains.goerli.id
            })
            return typeof rusdBalanceOfCall.data === "number" ? rusdBalanceOfCall.data : undefined
        } else {
            return undefined
        }
    }


    getAvailableSynths(): Synth[] {
        return AvailableSynth
    }

    getRusdAddress(): string {
        return RusdAddress
    }

}

export default EthereumNetwork;
