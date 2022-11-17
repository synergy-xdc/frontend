import { NetworkContext } from "@/networks/all";
import type { NextComponentType } from "next";
import React, { useContext, useEffect } from "react";

import {
    InputGroup,
    Panel,
    Input,
    Form,
    FlexboxGrid,
    InputNumber,
    Button,
    ButtonGroup,
    useToaster,
    Stack,
    IconButton,
    DatePicker,
    Table,
    SelectPicker
} from "rsuite";

import {
    getStateHandlingCallback,
    WalletAskConfirmTX,
    WalletTXSuccessfullyBroadcasted,
} from "@/components/WalletNotification";
import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";
import { BigNumber } from "ethers";

const UserRetableView_: NextComponentType = ({
    purpose,
    unit,
    value,
    ...props
}) => {
    return (
        <Panel bordered shaded header={purpose} style={{ marginBottom: 20 }}>
            <InputGroup>
                <Input readOnly value={value} />
                <InputGroup.Addon>{unit}</InputGroup.Addon>
            </InputGroup>
        </Panel>
    );
};

const UserRelatebleView: NextComponentType = () => {
    const networkProvider = useContext(NetworkContext);
    const rawPrice = networkProvider.getRawPrice();
    const rawBalance = networkProvider.getRawBalance();
    const rawInUsd = rawBalance ? rawPrice?.mulAmount(rawBalance) : undefined;
    const rusdBalance = networkProvider.getRusdBalance();
    const currentCRation = networkProvider.getCurrentCRatio();

    return (
        <Panel bordered shaded header="Address relatable">
            <InputGroup>
                <InputGroup.Addon>Balance (RAW)</InputGroup.Addon>
                <Input readOnly value={rawBalance?.toHumanString(5)} />
            </InputGroup>
            <Form.HelpText style={{ marginTop: 5 }}>
                &nbsp;~ {rawInUsd?.toHumanString(2)}$ (price:{" "}
                {rawPrice?.toHumanString(5)}$)
            </Form.HelpText>
            <br />
            <InputGroup>
                <InputGroup.Addon>Balance (rUSD)</InputGroup.Addon>
                <Input readOnly value={rusdBalance?.toHumanString(2)} />
            </InputGroup>
            <br />
            <InputGroup>
                <InputGroup.Addon>C-Ratio</InputGroup.Addon>
                <Input readOnly value={currentCRation} />
            </InputGroup>
            <Form.HelpText style={{ marginTop: 5 }}>
                &nbsp;Min allowed: 150%
            </Form.HelpText>
            <br />
            <InputGroup>
                <InputGroup.Addon>Active debt (rUSD)</InputGroup.Addon>
                <Input readOnly value="344.23" />
            </InputGroup>
            <br />
            <InputGroup>
                <InputGroup.Addon>Compensation (rUSD)</InputGroup.Addon>
                <Input readOnly value="11.32" />
            </InputGroup>
            <br />
            <InputGroup>
                <InputGroup.Addon>Staked (RAW)</InputGroup.Addon>
                <Input readOnly value="23423.43" />
            </InputGroup>
            <Form.HelpText style={{ marginTop: 5 }}>&nbsp;~ 3455.34$</Form.HelpText>
        </Panel>
    );
};

const Staking: NextComponentType = () => {
    // const [rawValue, setRawValue] = React.useState<number>(100);
    const networkProvider = useContext(NetworkContext);
    const rawBalance = networkProvider.getRawBalance();
    const rawInsuranceAllowance = networkProvider.getRawInsuranceAllowance();

    const [rawToStakeValue, setRawToStakeValue] = React.useState<Amount>(
        rawBalance ? rawBalance : new Amount(BigNumber.from(0), 18)
    );

    const insurancesList = networkProvider.getUserInssurances();

    const defaultDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 2))

    const [unlockDate, setUnlockDate] = React.useState<Date>(defaultDate);

    const toaster = useToaster();
    const stakeCallback = networkProvider.stakeRawCallback(
        rawToStakeValue,
        unlockDate,
        getStateHandlingCallback(toaster)
    );
    const rawAllowanceCallback = networkProvider.getNewRawAllowanceCallback(
        rawToStakeValue,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Staking">
            <p>
            Stake RAW tokens to insure your collateral from debt pool losses. The longer the lock time, the greater the percentage of your insurance can be reimbursed (min 30 days, max 730 days).
            <br />
            <br />
            <span style={{color: "orange"}}>WARNING: Insurance can be returned only after the expiration of the lock.</span>
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>RAW amount</Form.ControlLabel>
                <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                    <InputGroup.Button
                        onClick={() =>
                            setRawToStakeValue(
                                new Amount(
                                    rawToStakeValue.amount.sub(
                                        BigNumber.from(10).pow(rawToStakeValue.decimals + 1)
                                    ),
                                    rawToStakeValue.decimals
                                )
                            )
                        }
                    >
                        -
                    </InputGroup.Button>
                    <InputNumber
                        className="no-arrows-input-number"
                        // step={10.1}
                        value={rawToStakeValue.toHumanString(2)}
                        onChange={(val) =>
                            setRawToStakeValue(
                                Amount.fromString(
                                    typeof val == "string" ? val : val.toString(),
                                    rawToStakeValue.decimals
                                )
                            )
                        }
                    />
                    <InputGroup.Button
                        onClick={() =>
                            setRawToStakeValue(
                                new Amount(
                                    rawToStakeValue.amount.add(
                                        BigNumber.from(10).pow(rawToStakeValue.decimals + 1)
                                    ),
                                    rawToStakeValue.decimals
                                )
                            )
                        }
                    >
                        +
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: {rawBalance?.toHumanString(4)}</Form.HelpText>
                <Form.HelpText>Allowance: {rawInsuranceAllowance?.toHumanString(4)}</Form.HelpText>
            </Form.Group>
            <br />
            <Form.Group controlId="_">
                <Form.ControlLabel>Unlock date</Form.ControlLabel>
                <DatePicker
                    style={{ marginTop: 5, marginBottom: 5 }}
                    format="yyyy-MM-dd"
                    ranges={[]}
                    block
                    defaultValue={defaultDate}
                    onChange={setUnlockDate}
                />
                {/* <Form.HelpText>RAW insurance: TODO</Form.HelpText> */}
            </Form.Group>
            <br />
            <ButtonGroup justified>
                <Button
                    style={{ backgroundColor: "#089a81", borderWidth: 2 }}
                    appearance="primary"
                    color="green"
                    disabled={
                        parseFloat(rawInsuranceAllowance?.toHumanString(18)) >=
                        parseFloat(rawToStakeValue?.toHumanString(18))
                    }
                    onClick={async () => rawAllowanceCallback()}
                >
                    <b>Approve</b>
                </Button>
                <Button
                    style={{ backgroundColor: "#089a81", borderWidth: 2 }}
                    disabled={
                        parseFloat(rawInsuranceAllowance?.toHumanString(18)) <
                        parseFloat(rawToStakeValue?.toHumanString(18))
                    }
                    appearance="primary"
                    color="green"
                    onClick={async () => stakeCallback()}
                >
                    <b>Stake</b>
                </Button>
            </ButtonGroup>
            <hr />
            <Table
                rowHeight={60}
                autoHeight
                style={{ borderRadius: 10 }}
                cellBordered

                data={insurancesList}
                renderEmpty={() => (
                    <span style={{ alignContent: "center" }}>
                        <br />
                        No any insurances
                    </span>
                )}
            >
                <Table.Column
                    verticalAlign="middle"
                    width={170}
                    align="left"
                    fixed
                    flexGrow={1}
                >
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.Cell dataKey="id" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={100} flexGrow={1}>
                    <Table.HeaderCell>RAW Locked</Table.HeaderCell>
                    <Table.Cell dataKey="rawLocked" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={200} flexGrow={1}>
                    <Table.HeaderCell>Locked At</Table.HeaderCell>
                    <Table.Cell dataKey="lockedAt" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                    <Table.HeaderCell>Available At</Table.HeaderCell>
                    <Table.Cell dataKey="availableAt" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                    <Table.HeaderCell>RAW Repaid</Table.HeaderCell>
                    <Table.Cell dataKey="rawRepaid" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                    <Table.HeaderCell>Available RAW Compensation</Table.HeaderCell>
                    <Table.Cell dataKey="availableCompensationString" />
                </Table.Column>

                <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                    <Table.HeaderCell>#</Table.HeaderCell>
                    <Table.Cell dataKey="unstakeButton" />
                </Table.Column>
            </Table>
        </Panel>
    );
};

const Mint: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);


    const toaster = useToaster();

    const wethAllowance = networkProvider.getWethAllowance();
    const rusdBalance = networkProvider.getRusdBalance();
    const wethBalance = networkProvider.getWethBalance();

    const [wethValue, setWethValue] = React.useState<Amount>(
        wethBalance ? wethBalance : new Amount(BigNumber.from(0), 18)
    );
    const [rusdValue, setRusdValue] = React.useState<Amount>(
        rusdBalance ? rusdBalance : new Amount(BigNumber.from(0), 18)
    );

    const setNewWethAllowanceCallback =
        networkProvider.getNewWethAllowanceCallback(
            wethValue,
            getStateHandlingCallback(toaster)
        );
    const mintCallback = networkProvider.getMintCallback(
        rusdValue,
        wethValue,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel
            bordered
            shaded
            header="Mint rUSD"
        >
            <p>
            Deposit WETH as a collateral and get rUSD in return. Resulting collateral ratio should be greater than min collateral ratio
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>rUSD amount</Form.ControlLabel>
                <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                    <InputGroup.Button
                        onClick={() =>
                            setRusdValue(
                                new Amount(
                                    rusdValue.amount.sub(BigNumber.from(10).pow(18)),
                                    rusdValue.decimals
                                )
                            )
                        }
                    >
                        -
                    </InputGroup.Button>
                    <InputNumber
                        className="no-arrows-input-number"
                        step={0.1}
                        value={rusdValue?.toHumanString(18)}
                        onChange={(val) => {
                                console.log("DOT", val, Amount.fromString(
                                        typeof val == "string" ? val : val.toString(),
                                        18
                                    ).toHumanString(18));
                                setRusdValue(
                                    Amount.fromString(
                                        typeof val == "string" ? val : val.toString(),
                                        18
                                    )
                                )
                            }
                        }
                    />
                    <InputGroup.Button
                        onClick={() =>
                            setRusdValue(
                                new Amount(rusdValue.amount.add(BigNumber.from(10).pow(18)), 18)
                            )
                        }
                    >
                        +
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: {rusdBalance?.toHumanString(5)}</Form.HelpText>
            </Form.Group>
            <br />
            <Form.Group controlId="_">
                <Form.ControlLabel>WETH amount</Form.ControlLabel>
                <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                    <InputGroup.Button
                        onClick={() =>
                            setWethValue(
                                new Amount(
                                    wethValue.amount.sub(
                                        BigNumber.from(10).pow(wethValue.decimals - 1)
                                    ),
                                    wethValue.decimals
                                )
                            )
                        }
                    >
                        -
                    </InputGroup.Button>
                    <InputNumber
                        className="no-arrows-input-number"
                        step={0.1}
                        value={wethValue.toHumanString(18)}
                        onChange={(val) =>
                            setWethValue(
                                Amount.fromString(
                                    typeof val == "string" ? val : val.toString(),
                                    wethValue.decimals
                                )
                            )
                        }
                    />
                    <InputGroup.Button
                        onClick={() =>
                            setWethValue(
                                new Amount(
                                    wethValue.amount.add(
                                        BigNumber.from(10).pow(wethValue.decimals - 1)
                                    ),
                                    wethValue.decimals
                                )
                            )
                        }
                    >
                        +
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: {wethBalance?.toHumanString(6)}</Form.HelpText>
                <Form.HelpText>
                    Allowance: {wethAllowance?.toHumanString(2)}
                </Form.HelpText>
                <hr />
                <Form.HelpText>
                    Current C-ratio: {networkProvider.getCurrentCRatio()}%
                </Form.HelpText>
                <Form.HelpText>
                    New C-ratio:{" "}
                    {networkProvider.predictCollateralRatio(rusdValue, wethValue, true)}%
                </Form.HelpText>
                <Form.HelpText>
                    Min C-ratio: {networkProvider.getMinCRatio()}%
                </Form.HelpText>
            </Form.Group>
            <br />
            <ButtonGroup justified>
                <Button
                    appearance="ghost"
                    disabled={
                        parseFloat(wethAllowance?.toHumanString(18)) >=
                        parseFloat(wethValue?.toHumanString(18))
                    }
                    style={{ marginBottom: 7, borderWidth: 2 }}
                    onClick={async () => setNewWethAllowanceCallback()}
                >
                    <b>Approve</b>
                </Button>
                <Button
                    appearance="ghost"
                    disabled={
                        parseFloat(wethAllowance?.toHumanString(18)) <
                        parseFloat(wethValue?.toHumanString(18))
                    }
                    style={{ marginBottom: 7, borderWidth: 2 }}
                    onClick={async () => {
                            console.log(123123); mintCallback()
                        }
                    }
                >
                    <b>Mint</b>
                </Button>
            </ButtonGroup>
        </Panel>
    );
};

const Burn: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const rusdBalance = networkProvider.getRusdBalance();
    const wrappedGasTokenBalance = networkProvider.getWethBalance();
    const wethLocked = networkProvider.wethLocked();
    const rawRepay = networkProvider.rawRepay();
    const rawPrice = networkProvider.getRawPrice();
    const minCRation = networkProvider.getMinCRatio();
    const debt = networkProvider.userDebt();

    const rusdInsuranceAllowance = new Amount(BigNumber.from(0), 18);
    const [rusdValue, setRusdValue] = React.useState<Amount>(
        rusdBalance ? rusdBalance : new Amount(BigNumber.from(0), 18)
    );

    const toaster = useToaster();
    const [wrappedGasTokenValue, setWrappedGasTokenValue] = React.useState<Amount>(
        wrappedGasTokenBalance ? wrappedGasTokenBalance : new Amount(BigNumber.from(0), 18)
    );

    const [insuranceId, setInsuranceId] = React.useState<string | null>(null);
    const userInsurances = networkProvider.getUserInssurances();

    const withdrawNewCRatio = networkProvider.predictCollateralRatio(
        new Amount(BigNumber.from(0), 18),
        wrappedGasTokenValue,
        false
    )

    const BurnNewCRatio = networkProvider.predictCollateralRatio(
        rusdValue,
        new Amount(BigNumber.from(0), 18),
        false
    )


    const burnCallback = networkProvider.getBurnRusdCallback(
        rusdValue,
        insuranceId ? insuranceId : "0x0000000000000000000000000000000000000000000000000000000000000000",
        getStateHandlingCallback(toaster)
    );
    const withdrawCallback = networkProvider.unlockWethCallback(
        wrappedGasTokenValue,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Burn rUSD">
            <p>
            Burn rUSD to increase your collateral ratio and get ability to withdraw collateral in WETH. You can choose insurance to repay your debt pool losses in RAW.
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>Burn rUSD amount</Form.ControlLabel>
                <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                    <InputGroup.Button
                        onClick={() =>
                            setRusdValue(
                                new Amount(
                                    rusdValue.amount.sub(
                                        BigNumber.from(10).pow(rusdValue.decimals)
                                    ),
                                    rusdValue.decimals
                                )
                            )
                        }
                    >
                        -
                    </InputGroup.Button>
                    <InputNumber
                        className="no-arrows-input-number"
                        step={0.1}
                        value={rusdValue.toHumanString(18)}
                        onChange={(val) =>
                            setRusdValue(
                                Amount.fromString(
                                    typeof val == "string" ? val : val.toString(),
                                    rusdValue.decimals
                                )
                            )
                        }
                    />
                    <InputGroup.Button
                        onClick={() =>
                            setRusdValue(
                                new Amount(
                                    rusdValue.amount.add(
                                        BigNumber.from(10).pow(rusdValue.decimals)
                                    ),
                                    rusdValue.decimals
                                )
                            )
                        }
                    >
                        +
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Current balance: {rusdBalance?.toHumanString(2)}</Form.HelpText>
                <Form.HelpText>New balance: {
                    new Amount(rusdBalance?.amount.sub(rusdValue?.amount) ?? BigNumber.from(0), 18).toHumanString(2)
                }</Form.HelpText>
                <Form.HelpText>Your rUSD debt: {debt?.toHumanString(2)}</Form.HelpText>
            </Form.Group>
            <br/>
            <Form.Group controlId="_">
                <Form.ControlLabel>Insurance rUSD amount</Form.ControlLabel>
                <div style={{ marginTop: 5, marginBottom: 5 }}>
                    <SelectPicker
                        label="Insurance"
                        data={
                            userInsurances.map(
                                (elem) => ({
                                    label: `${elem.id.slice(0, 6)}... (Max: ${elem.availableCompensation?.toHumanString(4)} RAW)`,
                                    value: elem.id
                                })
                            )
                        }
                        onChange={setInsuranceId}
                        block
                        defaultValue={"0x0000000000000000000000000000000000000000000000000000000000000000"}
                    />
                </div>
                <Form.HelpText>Current RAW repay: {rawRepay?.toHumanString(4)} ({rawPrice ? rawRepay?.mulAmount(rawPrice).toHumanString(2) : 0}$, price: {rawPrice?.toHumanString(5)}$)</Form.HelpText>
                <Form.HelpText>
                    New C-ratio: {BurnNewCRatio}%
                </Form.HelpText>
                <Form.HelpText>
                    Min C-ratio: {minCRation}%
                </Form.HelpText>
            </Form.Group>
            <br />
            <Button
                color="orange"
                appearance="ghost"
                block
                style={{ marginBottom: 7, borderWidth: 2 }}
                onClick={async () => burnCallback()}
            >
                <b>Burn rUSD</b>
            </Button>
            <hr />
            <p>
            Withdraw WETH collateral (this decreases collateral ratio).
            </p>
            <br />
            <Form.Group controlId="_">
                <Form.ControlLabel>Unlock WETH</Form.ControlLabel>
                <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                    <InputGroup.Button
                        onClick={() =>
                            setWrappedGasTokenValue(
                                new Amount(
                                    wrappedGasTokenValue.amount.sub(
                                        BigNumber.from(10).pow(wrappedGasTokenValue.decimals - 1)
                                    ),
                                    wrappedGasTokenValue.decimals
                                )
                            )
                        }
                    >
                        -
                    </InputGroup.Button>
                    <InputNumber
                        className="no-arrows-input-number"
                        step={0.01}
                        value={wrappedGasTokenValue.toHumanString(18)}
                        onChange={(val) =>
                            setWrappedGasTokenValue(
                                Amount.fromString(
                                    typeof val == "string" ? val : val.toString(),
                                    wrappedGasTokenValue.decimals
                                )
                            )
                        }
                    />

                    <InputGroup.Button
                        onClick={() =>
                            setWrappedGasTokenValue(
                                new Amount(
                                    wrappedGasTokenValue.amount.add(
                                        BigNumber.from(10).pow(wrappedGasTokenValue.decimals - 1)
                                    ),
                                    wrappedGasTokenValue.decimals
                                )
                            )
                        }
                    >
                        +
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>
                    Locked WETH Amount: {wethLocked?.toHumanString(5)}
                </Form.HelpText>
                <Form.HelpText>
                    Current balance: {wrappedGasTokenBalance?.toHumanString(5)}
                </Form.HelpText>
                <Form.HelpText>
                    New C-ratio: {withdrawNewCRatio}%
                </Form.HelpText>
                <Form.HelpText>
                    Min C-ratio: {minCRation}%
                </Form.HelpText>
            </Form.Group>
            <br />
            <Button
                color="violet"
                appearance="ghost"
                block
                style={{
                    marginBottom: 7,
                    borderWidth: 2,
                    borderColor: "#b6a1e3",
                    color: "#b6a1e3",
                }}
                onClick={async () => withdrawCallback()}
            >
                <b>Withdraw WETH</b>
            </Button>
        </Panel>
    );
};

const RusdView: NextComponentType = () => {
    return (
        <>
            <FlexboxGrid justify="space-around">
                <FlexboxGrid.Item colspan={23}>
                    <Staking />
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            <FlexboxGrid justify="space-around">
                <FlexboxGrid.Item colspan={11}>
                    <Mint />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={11}>
                    <Burn />
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </>
    );
};

export default RusdView;
