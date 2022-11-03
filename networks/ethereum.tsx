import BaseNetwork, { Synth, WalletPrimaryData } from "@/networks/base";
import { ConnectButton, useAccount, useBalance, useContractRead, Web3Modal, useToken, useContractWrite, useWaitForTransaction } from "@web3modal/react";
import { ReactNode } from "react";
import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import OracleABI from "@/abi/Oracle.json";
import WethABI from "@/abi/WETH.json";
import { chains } from "@web3modal/ethereum";
import { BigNumber, ethers, utils } from "ethers";
import React from "react";


const SynergyAddress: string = "0xf8af6846d2F512F3E14Ea3D56ad8De00d377B3c3";

const walletConnectConfig = {
    projectId: "12647116f49027a9b16f4c0598eb6d74",
    theme: "dark",
    accentColor: "default",
    ethereum: {
        appName: 'web3Modal',
        autoConnect: true,
        chains: [chains.goerli]
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
        const synergyCallResult = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "rUsd",
            chainId: chains.goerli.id
        });
        const rusdContract = useToken({
            address: synergyCallResult.data
        })
        const rusdBalanceOfCall = useContractRead({
            address: synergyCallResult.data as string,
            abi: RusdABI,
            functionName: "balanceOf",
            args: [account.address],
            chainId: chains.goerli.id
        })
        if (rusdBalanceOfCall.data !== undefined && rusdContract.data?.decimals !== undefined) {
            const balance: BigNumber = rusdBalanceOfCall.data as BigNumber;
            return balance.div(BigNumber.from(10).pow(rusdContract.data.decimals)).toNumber()
        }
        return undefined
    }

    getRawBalance(): number | undefined {
        const { account, isReady } = useAccount();
        const synergyCallResult = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
            chainId: chains.goerli.id
        });
        const rawContract = useToken({
            address: synergyCallResult.data
        })
        const rawBalanceOfCall = useContractRead({
            address: synergyCallResult.data as string,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
            chainId: chains.goerli.id
        })
        if (rawBalanceOfCall.data !== undefined && rawContract.data?.decimals !== undefined) {
            const balance: BigNumber = rawBalanceOfCall.data as BigNumber;
            return balance.div(BigNumber.from(10).pow(rawContract.data.decimals)).toNumber()
        }
        return undefined
    }

    getRawPrice(): number | undefined {
        const { account, isReady } = useAccount();
        const oracleContractAddressCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
            chainId: chains.goerli.id
        });
        const rawContractAddressCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
            chainId: chains.goerli.id
        });
        const rawPriceCall = useContractRead({
            address: oracleContractAddressCall.data as string,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
            chainId: chains.goerli.id
        })
        if (rawPriceCall.data !== undefined) {
            const rawPrice = rawPriceCall.data[0] as BigNumber;
            const rawPriceDecimals = rawPriceCall.data[1] as BigNumber;
            return rawPrice.div(BigNumber.from(10).pow(rawPriceDecimals)).toNumber();
        } else {
            return undefined;
        }
    }

    getWethPrice(): number | undefined {
        const { account, isReady } = useAccount();
        const oracleContractAddressCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
            chainId: chains.goerli.id
        });
        const rawContractAddressCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id
        });
        const rawPriceCall = useContractRead({
            address: oracleContractAddressCall.data as string,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
            chainId: chains.goerli.id
        })
        if (rawPriceCall.data !== undefined) {
            const rawPrice = rawPriceCall.data[0] as BigNumber;
            const rawPriceDecimals = rawPriceCall.data[1] as BigNumber;
            return rawPrice.div(BigNumber.from(10).pow(rawPriceDecimals)).toNumber();
        } else {
            return undefined;
        }
    }

    getWethBalance(): number | undefined {
        const { account, isReady } = useAccount();
        const synergyCallResult = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id
        });
        const wethContract = useToken({
            address: synergyCallResult.data
        })
        const wethBalanceOfCall = useContractRead({
            address: synergyCallResult.data as string,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
            chainId: chains.goerli.id
        })
        if (wethBalanceOfCall.data !== undefined && wethContract.data?.decimals !== undefined) {
            const balance: BigNumber = wethBalanceOfCall.data as BigNumber;
            return balance.div(BigNumber.from(10).pow(wethContract.data.decimals)).toNumber()
        }
        return undefined
    }

    getWethAllowance(): number | undefined {
        const { account, isReady } = useAccount();
        const synergyCallResult = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id
        });
        const wethContract = useToken({
            address: synergyCallResult.data
        })
        const wethAllowanceCall = useContractRead({
            address: synergyCallResult.data as string,
            abi: WethABI,
            functionName: "allowance",
            args: [account.address, SynergyAddress],
            chainId: chains.goerli.id
        })
        if (wethAllowanceCall.data !== undefined && wethContract.data?.decimals !== undefined) {
            const balance: BigNumber = wethAllowanceCall.data as BigNumber;
            return balance.div(BigNumber.from(10).pow(wethContract.data.decimals)).toString()
        }
        return undefined
    }


    getAvailableSynths(): Synth[] {
        return AvailableSynth
    }

    getCurrentCRatio(): number | undefined {
        const { account, isReady } = useAccount();
        const synergyCollateralRatioCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "collateralRatio",
            args: [account.address],
            chainId: chains.goerli.id
        });
        if (synergyCollateralRatioCall.data !== undefined) {
            return synergyCollateralRatioCall.data / (10 ** 8)
        }
        return undefined
    }
    getMinCRatio(): number | undefined {
        const synergyMinCollateralRatioCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "minCollateralRatio",
            chainId: chains.goerli.id
        });
        if (synergyMinCollateralRatioCall.data !== undefined) {
            const ratio: number = synergyMinCollateralRatioCall.data as number;
            return ratio / (10 ** 8) * 100
        }
        return undefined
    }

    getNewWethAllowanceCallback(human_amount: number): Function {
        const { account } = useAccount();
        const synergyWethCall = useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id
        });
        const wethContract = useToken({
            address: synergyWethCall.data
        })
        const setWethAllowanceSign = useContractWrite({
            address: synergyWethCall.data,
            abi: WethABI,
            functionName: 'approve',
            args: [SynergyAddress, wethContract.data === undefined ? 0 : (human_amount * (10 ** wethContract.data?.decimals)).toString()],
            chainId: chains.goerli.id,

        })
        const signWait = useWaitForTransaction({ hash: setWethAllowanceSign.data?.hash });

        return setWethAllowanceSign.write

    }
}

export default EthereumNetwork;
