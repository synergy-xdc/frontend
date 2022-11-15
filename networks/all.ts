import React, { Context } from "react";
import BaseNetwork from "@/networks/base/network";
import TronNetwork from "@/networks/implementations/tron/network";
import EthereumNetwork from "./implementations/eth/network";

interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "ethereum": new EthereumNetwork(),
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["ethereum"]);

export default AVAILABLE_NETWORKS;
