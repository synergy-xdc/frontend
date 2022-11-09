import BaseNetwork, { Synth, WalletPrimaryData } from "@/networks/base";
import { ReactNode } from "react";
import { Button } from "rsuite";

class WavesEnterpriseNetwork extends BaseNetwork {
    
    getRusdBalance(): number {
        throw new Error("Method not implemented.");
    }
    getAvailableSynths(): Synth[] {
        throw new Error("Method not implemented.");
    }
    getRusdAddress(): string {
        throw new Error("Method not implemented.");
    }
    connectButton(): ReactNode {
        return (
            <Button style={{backgroundColor: "linear-gradient(transparent, #089a81)"}} appearance='primary'>Connect Wallet</Button>
        );
    }
    showWallet(): WalletPrimaryData | null {
        throw new Error("Method not implemented.");
    }
}

export default WavesEnterpriseNetwork;
