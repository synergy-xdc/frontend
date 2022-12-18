import React, { Context } from "react";
import BaseNetwork from "@/networks/base/network";
import XDCTestnetNetwork from "./implementations/xdc-testnet/network";
import XDCMainnetNetwork from "./implementations/xdc-mainnet/network";

interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "testnet": new XDCTestnetNetwork(),
    "mainnet": new XDCMainnetNetwork()
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["mainnet"]);

export default AVAILABLE_NETWORKS;
