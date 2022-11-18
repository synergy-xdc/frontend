import Amount from "@/networks/base/amount";
import { BigNumber } from "ethers";
import React from "react";


import { Stack, Panel, Button, Form, FlexboxGrid, useToaster } from "rsuite";
import InputAmount from "@/components/InputAmount";
import { NextComponentType } from "next/types";
import FormHelpText from "rsuite/esm/FormHelpText";
import { NetworkContext } from "@/networks/all";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { getStateHandlingCallback } from "../WalletNotification";
import Script from "next/script";


const MintWethView: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const [wethToMintAmount, setWethToMintAmount] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    )
    const wethBalance = networkProvider.getWethBalance();
    const mintWethCallback = networkProvider.mintWethCallback(
        wethToMintAmount,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="WETH faucet">
            <InputAmount
                title="WETH amount"
                value={wethToMintAmount}
                setValue={setWethToMintAmount}
                decimalsShift={2}
            >
                <Form.HelpText>Balance: {wethBalance?.toHumanString(5)}</Form.HelpText>
            </InputAmount>
            <br />
            <Button
                appearance="primary"
                color="orange"
                block
                onClick={async () => {mintWethCallback()}}
            >
                Mint
            </Button>
        </Panel>
    );
}

const MintRawView: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const [rawToMintAmount, setRawToMintAmount] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    )

    const rawBalance = networkProvider.getRawBalance();
    const mintRawCallback = networkProvider.mintRawCallback(
        rawToMintAmount,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="RAW faucet">
            <InputAmount
                title="RAW amount"
                value={rawToMintAmount}
                setValue={setRawToMintAmount}
                decimalsShift={2}
            >
                <Form.HelpText>Balance: {rawBalance?.toHumanString(5)}</Form.HelpText>
            </InputAmount>
            <br />
            <Button
                appearance="primary"
                color="orange"
                block
                onClick={async () => {mintRawCallback()}}
            >
                Mint
            </Button>
        </Panel>
    );
}



const FaucetView: NextComponentType = () => {
    return (
        <>
            <FlexboxGrid justify="space-around">
            <FlexboxGrid.Item colspan={11}>
                <MintWethView />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={11}>
                <MintRawView />
            </FlexboxGrid.Item>
            </FlexboxGrid>
        </>
    );
}


export default FaucetView;
