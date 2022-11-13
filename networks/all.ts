import React, { Context } from "react";
import BaseNetwork from "@/networks/base/network";
import TronNetwork from "@/networks/implementations/tron/network";

interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "tron": new TronNetwork(),
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["tron"]);

export default AVAILABLE_NETWORKS;
