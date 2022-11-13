import React, { Context } from "react";
import BaseNetwork from "./base";
import TronNetwork from "./tron";

interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "tron": new TronNetwork(),
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["tron"]);

export default AVAILABLE_NETWORKS;
