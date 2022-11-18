import { NetworkContext } from "@/networks/all";
import Amount from "@/networks/base/amount";
import { FrontendLoan, FrontendSynth } from "@/networks/base/network";
import { BigNumber, utils } from "ethers";
import type { NextComponentType } from "next";
import React from "react";

import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import {
    Button,
    ButtonGroup,
    Input,
    FlexboxGrid,
    Form,
    InputGroup,
    InputNumber,
    Panel,
    Progress,
    SelectPicker,
    Whisper,
    Table,
    useToaster,
} from "rsuite";
import FormControl from "rsuite/esm/FormControl";
import FormGroup from "rsuite/esm/FormGroup";
import InputAmount from "../InputAmount";
import { getStateHandlingCallback } from "../WalletNotification";


const ActivePositionsPlaceholder = [
    {
        name: "GOLD",
        kind: <span style={{ color: "#089a81" }}>Long</span>,
        amount_rusd: "$1223.34",
        amount: "0.2322",
        current_price: <span style={{ color: "#089a81" }}>$2545.44 (+0.12%)</span>,
    },
    {
        name: "SILVER",
        kind: <span style={{ color: "#f33645" }}>Short</span>,
        amount_rusd: "$232.32",
        amount: "0.34234",
        current_price: <span style={{ color: "#089a81" }}>$1545.44 (-1.54%)</span>,
    },
];

const LoanSynth: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const rusdBalance = networkProvider.getRusdBalance();
    const rusdLoanAllowance = networkProvider.getRusdLoanAllowance();
    const minLoanCRatio = networkProvider.minLoanColateralRatio()
    const availableSynths = networkProvider.getAvailableSynths();

    const [synthAddressToBorrow, setSynthAddressToBorrow] = React.useState<string>(availableSynths?.[availableSynths.length - 1]?.address ?? "0x0");
    const [amountToBorrow, setAmountToBorrow] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    );
    const [amountToPledge, setAmountToPledge] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    );
    const synthBalance = networkProvider.getSynthBalance(synthAddressToBorrow);
    const synthPrice = networkProvider.synthPrice(synthAddressToBorrow);

    const predictedCRatio = networkProvider.predictBorrowCollateralRatio(
        undefined,
        synthAddressToBorrow,
        amountToBorrow,
        amountToPledge,
        true
    )

    const borrowCallback = networkProvider.borrowSynthCallback(
        synthAddressToBorrow,
        amountToBorrow,
        amountToPledge,
        getStateHandlingCallback(toaster)
    );
    const approveCallback = networkProvider.setRusdLoanAllowanceCallback(
        amountToPledge,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Borrowing">
            <div style={{ textAlign: "left" }}>
                <Form.Group>
                    <SelectPicker
                        // size="lg"
                        label="Synth"
                        data={
                            availableSynths.map((inst) => {
                                return {
                                    label: inst.fullName,
                                    value: inst.address
                                }
                            })
                        }
                        block
                        onChange={setSynthAddressToBorrow}
                        // cleanable={false}
                        defaultValue={synthAddressToBorrow}
                    />
                </Form.Group>
                <br />
                <Form.Group controlId="_">
                    <Form.ControlLabel>Borrow amount (synth)</Form.ControlLabel>
                    <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                        <InputGroup.Button
                            onClick={() =>
                                setAmountToBorrow(
                                    new Amount(
                                        amountToBorrow.amount.sub(
                                            BigNumber.from(10).pow(amountToBorrow.decimals + 1)
                                        ),
                                        amountToBorrow.decimals
                                    )
                                )
                            }
                        >
                            -
                        </InputGroup.Button>
                        <InputNumber
                            className="no-arrows-input-number"
                            // step={10.1}
                            value={amountToBorrow.toHumanString(2)}
                            onChange={(val) =>
                                setAmountToBorrow(
                                    Amount.fromString(
                                        typeof val == "string" ? val : val.toString(),
                                        amountToBorrow.decimals
                                    )
                                )
                            }
                        />
                        <InputGroup.Button
                            onClick={() =>
                                setAmountToBorrow(
                                    new Amount(
                                        amountToBorrow.amount.add(
                                            BigNumber.from(10).pow(amountToBorrow.decimals + 1)
                                        ),
                                        amountToBorrow.decimals
                                    )
                                )
                            }
                        >
                            +
                        </InputGroup.Button>
                    </InputGroup>
                    <Form.HelpText>Balance: {synthBalance?.toHumanString(4)} (price: {synthPrice?.toHumanString(6)}$)</Form.HelpText>
                </Form.Group>
                <br />
                <Form.Group controlId="_">
                    <Form.ControlLabel>Pledge amount (rUSD)</Form.ControlLabel>
                    <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                        <InputGroup.Button
                            onClick={() =>
                                setAmountToPledge(
                                    new Amount(
                                        amountToPledge.amount.sub(
                                            BigNumber.from(10).pow(amountToPledge.decimals + 1)
                                        ),
                                        amountToPledge.decimals
                                    )
                                )
                            }
                        >
                            -
                        </InputGroup.Button>
                        <InputNumber
                            className="no-arrows-input-number"
                            value={amountToPledge.toHumanString(18)}
                            onChange={(val) =>
                                setAmountToPledge(
                                    Amount.fromString(
                                        typeof val == "string" ? val : val.toString(),
                                        amountToPledge.decimals
                                    )
                                )
                            }
                        />
                        <InputGroup.Button
                            onClick={() =>
                                setAmountToPledge(
                                    new Amount(
                                        amountToPledge.amount.add(
                                            BigNumber.from(10).pow(amountToPledge.decimals + 1)
                                        ),
                                        amountToPledge.decimals
                                    )
                                )
                            }
                        >
                            +
                        </InputGroup.Button>
                    </InputGroup>
                    <Form.HelpText>Balance: {rusdBalance?.toHumanString(4)}</Form.HelpText>
                    <Form.HelpText>Allowance: {rusdLoanAllowance?.toHumanString(4)}</Form.HelpText>
                </Form.Group>
                <hr />
                <Form.HelpText>
                    New C-ratio: {predictedCRatio}%
                </Form.HelpText>
                <Form.HelpText>
                    Min C-ratio: {minLoanCRatio}%
                </Form.HelpText>
                <br />
                <ButtonGroup justified>
                    <Button
                        style={{
                            borderColor: "#f26d9e",
                            // backgroundColor: "#ed4580",
                            color: "#f26d9e",
                            borderWidth: 2
                        }}
                        disabled={
                            parseFloat(rusdLoanAllowance?.toHumanString(18)) >=
                            parseFloat(amountToPledge?.toHumanString(18))
                        }
                        onClick={async () => {approveCallback()}}
                        appearance="ghost"
                    >
                        <b>Approve</b>
                    </Button>
                    <Button
                        style={{
                            borderColor: "#f26d9e",
                            // backgroundColor: "#ed4580",
                            color: "#f26d9e",
                            borderWidth: 2
                        }}
                        onClick={async () => {borrowCallback()}}
                        disabled={
                            parseFloat(rusdLoanAllowance?.toHumanString(18)) <
                            parseFloat(amountToPledge?.toHumanString(18))
                        }
                        appearance="ghost"
                    >
                        <b>Borrow</b>
                    </Button>
                </ButtonGroup>

            </div>
        </Panel>
    );


}

const TradeThePair: NextComponentType = () => {
    const [positionRusdValue, setPositionRusdValue] = React.useState<number>(10);
    const networkProvider = React.useContext(NetworkContext);
    const rusdBalance = networkProvider.getRusdBalance();

    return (
        <Panel bordered shaded header="Trade the Synth">
          <div style={{ textAlign: "left" }}>
            <Form.Group controlId="_">
              <Form.ControlLabel>Invest rUSD amount</Form.ControlLabel>
              <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                <InputGroup.Button
                  onClick={() => setPositionRusdValue(positionRusdValue + 10)}
                >
                  -
                </InputGroup.Button>
                <InputNumber
                  className="no-arrows-input-number"
                  value={positionRusdValue}
                  onChange={
                    (val) => setPositionRusdValue(parseInt(val)) // @ts-ignore
                  }
                />
                <InputGroup.Button
                  onClick={() => setPositionRusdValue(positionRusdValue + 10)}
                >
                  +
                </InputGroup.Button>
              </InputGroup>

              <Form.HelpText>
                Balance: {rusdBalance?.toHumanString(4)}
              </Form.HelpText>
            </Form.Group>
            <ButtonGroup style={{ marginTop: 12 }} justified>
              <Button
                style={{
                  borderColor: "#82363a",
                  backgroundColor: "#f33645",
                  color: "#FFF",
                }}
                appearance="primary"
                color="red"
              >
                <b>Short</b>
              </Button>
              <Button
                style={{
                  borderColor: "#1d5f5e",
                  backgroundColor: "#089a81",
                  color: "#FFF",
                }}
                appearance="primary"
                color="green"
              >
                <b>Long</b>
              </Button>
            </ButtonGroup>
          </div>
        </Panel>
    );
};




const WithdrawBorrows: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const userLoans: FrontendLoan[] | undefined = networkProvider.userLoans();
    const [selectedLoanId, setSelectedLoanId] = React.useState(undefined);
    const [amountToWithdraw, setAmoutToWithdraw] = React.useState<Amount>(new Amount(BigNumber.from(0), 18))

    const selectedBorrowDetail: FrontendLoan | undefined = userLoans?.find(elem => elem.borrowId === selectedLoanId);
    const predictedCRation = networkProvider.predictBorrowCollateralRatio(
        selectedLoanId,
        selectedBorrowDetail?.synthAddress ?? "0x0",
        new Amount(BigNumber.from(0), 18),
        amountToWithdraw,
        false
    );

    const withdrawCallback = networkProvider.withdrawLoanCallback(
        selectedLoanId,
        amountToWithdraw,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Withdraw collateral from a loan">
            <p>Select your borrow</p>
            <SelectPicker
                block
                size="lg"
                label="Borrow"
                data={
                    (userLoans ?? []).filter(elem => elem.synthSymbol !== "rUSD").map((inst) => {
                        return {
                            label: `${inst.borrowId.slice(0, 9)} (${inst.collateral.toHumanString(2)} rUSD & ${inst.borrowedSynthAmount.toHumanString(5)} ${inst.synthSymbol}, ratio: ${inst.collateralRation}% over min ${inst.minCollateralRatio}%)`,
                            value: inst.borrowId
                        }
                    })
                }
                onChange={setSelectedLoanId}
                cleanable={false}
                style={{marginTop: 5}}
                defaultValue={selectedLoanId}
            />
            <br />
            <InputAmount
                title="Amount to withdraw (rUSD)"
                value={amountToWithdraw}
                setValue={setAmoutToWithdraw}
                decimalsShift={1}
            >
                <Form.HelpText>New C-Ration: {predictedCRation}%</Form.HelpText>
                <Form.HelpText>Min C-Ration: {selectedBorrowDetail?.minCollateralRatio}%</Form.HelpText>
            </InputAmount>
            <br />
            <Button
                block
                disabled={selectedLoanId === undefined}
                appearance="primary"
                // color="violet"
                style={{backgroundColor: selectedLoanId == undefined ? "#48738a" : "#2e6585"}}
                onClick={async () => {withdrawCallback()}}
            >
                Withdraw
            </Button>

        </Panel>
    );
}

const RepayBorrow: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const userLoans: FrontendLoan[] | undefined = networkProvider.userLoans();
    const [selectedLoanId, setSelectedLoanId] = React.useState(undefined);
    const [amountToRepay, setAmoutToRepay] = React.useState<Amount>(new Amount(BigNumber.from(0), 18))

    const selectedBorrowDetail: FrontendLoan | undefined = userLoans?.find(elem => elem.borrowId === selectedLoanId);
    const predictedCRation = networkProvider.predictBorrowCollateralRatio(
        selectedLoanId,
        selectedBorrowDetail?.synthAddress ?? "0x0",
        amountToRepay,
        new Amount(BigNumber.from(0), 18),
        false
    );

    const repayCallback = networkProvider.repayLoanCallback(
        selectedLoanId,
        amountToRepay,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Repay a borrow">
            <p>Select your borrow</p>
            <SelectPicker
                block
                size="lg"
                label="Borrow"
                data={
                    (userLoans ?? []).filter(elem => elem.synthSymbol !== "rUSD").map((inst) => {
                        return {
                            label: `${inst.borrowId.slice(0, 9)} (${inst.collateral.toHumanString(2)} rUSD & ${inst.borrowedSynthAmount.toHumanString(5)} ${inst.synthSymbol}, ratio: ${inst.collateralRation}% over min ${inst.minCollateralRatio}%)`,
                            value: inst.borrowId
                        }
                    })
                }
                onChange={setSelectedLoanId}
                cleanable={false}
                style={{marginTop: 5}}
                defaultValue={selectedLoanId}
            />
            <br />
            <InputAmount
                title="Amount to repay (synth)"
                value={amountToRepay}
                setValue={setAmoutToRepay}
                decimalsShift={1}
            >
                <Form.HelpText>New C-Ration: {predictedCRation}%</Form.HelpText>
                <Form.HelpText>Min C-Ration: {selectedBorrowDetail?.minCollateralRatio}%</Form.HelpText>
            </InputAmount>
            <br />
            <Button
                block
                disabled={selectedLoanId === undefined}
                appearance="primary"
                style={{backgroundColor: selectedLoanId == undefined ? "#8a7f48" : "#85782e"}}
                onClick={async () => {repayCallback()}}
            >
                Repay
            </Button>

        </Panel>
    );
}


const DepositBorrows: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();

    const userLoans: FrontendLoan[] | undefined = networkProvider.userLoans();
    const rusdLoanAllowance = networkProvider.getRusdLoanAllowance();
    const [selectedLoanId, setSelectedLoanId] = React.useState(undefined);
    const [amountToDeposit, setAmoutToDeposit] = React.useState<Amount>(new Amount(BigNumber.from(0), 18))

    const selectedBorrowDetail: FrontendLoan | undefined = userLoans?.find(elem => elem.borrowId === selectedLoanId);
    const predictedCRation = networkProvider.predictBorrowCollateralRatio(
        selectedLoanId,
        selectedBorrowDetail?.synthAddress ?? "0x0",
        new Amount(BigNumber.from(0), 18),
        amountToDeposit,
        true
    );

    const approveCallback = networkProvider.setRusdLoanAllowanceCallback(
        amountToDeposit,
        getStateHandlingCallback(toaster)
    );
    const depositCallback = networkProvider.depositLoanCallback(
        selectedLoanId,
        amountToDeposit,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Depostit collateral to a loan">
            <p>Select your borrow</p>
            <SelectPicker
                block
                size="lg"
                label="Borrow"
                data={
                    (userLoans ?? []).filter(elem => elem.synthSymbol !== "rUSD").map((inst) => {
                        return {
                            label: `${inst.borrowId.slice(0, 9)} (${inst.collateral.toHumanString(2)} rUSD & ${inst.borrowedSynthAmount.toHumanString(5)} ${inst.synthSymbol}, ratio: ${inst.collateralRation}% over min ${inst.minCollateralRatio}%)`,
                            value: inst.borrowId
                        }
                    })
                }
                onChange={setSelectedLoanId}
                cleanable={false}
                style={{marginTop: 5}}
                defaultValue={selectedLoanId}
            />
            <br />
            <InputAmount
                title="Amount to deposit (rUSD)"
                value={amountToDeposit}
                setValue={setAmoutToDeposit}
                decimalsShift={1}
            >
                <Form.HelpText>Allowance: {rusdLoanAllowance?.toHumanString(2)}</Form.HelpText>
                <Form.HelpText>New C-Ration: {predictedCRation}%</Form.HelpText>
                <Form.HelpText>Min C-Ration: {selectedBorrowDetail?.minCollateralRatio}%</Form.HelpText>
            </InputAmount>
            <br />
            <ButtonGroup justified>
                <Button
                    appearance="primary"
                    style={{backgroundColor: selectedLoanId == undefined ? "#8a5e48" : "#854c2e"}}
                    onClick={async () => {approveCallback()}}
                    disabled={
                        parseFloat(rusdLoanAllowance?.toHumanString(18)) >=
                        parseFloat(amountToDeposit?.toHumanString(18))
                        || selectedLoanId === undefined
                    }
                >
                    Approve
                </Button>
                <Button
                    disabled={
                        parseFloat(rusdLoanAllowance?.toHumanString(18)) <
                        parseFloat(amountToDeposit?.toHumanString(18))
                        || selectedLoanId === undefined
                    }
                    appearance="primary"
                    style={{backgroundColor: selectedLoanId == undefined ? "#8a5e48" : "#854c2e"}}
                    onClick={async () => {depositCallback()}}
                >
                    Deposit
                </Button>
            </ButtonGroup>


        </Panel>
    );
}

const SwapSynthes: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const toaster = useToaster();
    const availableSynths = networkProvider.getAvailableSynths();

    const [synthFromAmount, setSynthFromAmount] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    );
    const [synthToAmount, setSynthToAmount] = React.useState<Amount>(
        new Amount(BigNumber.from(0), 18)
    );
    const [swapMethod, setSwapMethod] = React.useState<"swapFrom" | "swapTo">("swapFrom");
    const [fromSynth, setFromSynth] = React.useState<string>(availableSynths?.[0]?.address ?? "0x0");
    const [toSynth, setToSynth] = React.useState<string>(availableSynths?.[availableSynths.length - 1]?.address ?? "0x0");

    const synthFromBalance = networkProvider.getSynthBalance(fromSynth);
    const synthToBalance = networkProvider.getSynthBalance(toSynth);

    const synthFromPrice = networkProvider.synthPrice(fromSynth);
    const synthToPrice = networkProvider.synthPrice(toSynth);

    const swapCallback = networkProvider.swapSynthCallback(
        swapMethod,
        fromSynth, toSynth,
        swapMethod === "swapFrom" ? synthFromAmount : synthToAmount,
        getStateHandlingCallback(toaster)
    );

    return (
        <Panel bordered shaded header="Swap Synthes">
            <Form.Group controlId="_">
                {/* <Form.ControlLabel>From Synth</Form.ControlLabel> */}
                <InputGroup style={{ marginBottom: 5 }}>
                    <InputNumber
                        placeholder="From"
                        step={0.00001}
                        onChange={
                            (val) => {
                                const newSynthFromAmount = Amount.fromString(typeof val == "string" ? val : val.toString(), 18);
                                setSynthFromAmount(newSynthFromAmount);
                                setSwapMethod("swapFrom");
                                const priceQ = synthFromPrice?.amount / synthToPrice?.amount;
                                const newSynthToFloat = utils.parseUnits(
                                    (priceQ * parseFloat(newSynthFromAmount.toHumanString(18))).toString(),
                                    18
                                );
                                setSynthToAmount(new Amount(newSynthToFloat, 18));
                            }
                        }
                        value={synthFromAmount.toHumanString(18)}
                    />
                    <InputGroup.Button className="selector-in-input">
                        <SelectPicker
                            size="sm"
                            label="Synth"
                            data={
                                availableSynths.map((elem) => ({
                                    label: elem.fullName,
                                    value: elem.address
                                }))
                            }
                            // style={{ width: 300, minWidth: 250, }}
                            onChange={(val) => {
                                setFromSynth(val)
                                setSynthFromAmount(new Amount(BigNumber.from(0), 18))
                                setSynthToAmount(new Amount(BigNumber.from(0), 18))
                            }}
                            defaultValue={availableSynths?.[0]?.address}
                        />
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: {synthFromBalance?.toHumanString(5)} (price: {synthFromPrice?.toHumanString(6)}$)</Form.HelpText>
            </Form.Group>
            <br />
            <Form.Group controlId="_">
                <InputGroup style={{ marginBottom: 5 }}>
                    <InputNumber
                        step={0.00001}
                        placeholder="To"
                        onChange={(val) => {
                                const newSynthToAmount = Amount.fromString(typeof val == "string" ? val : val.toString(), 18);
                                setSynthToAmount(newSynthToAmount);
                                setSwapMethod("swapTo");
                                const priceQ = synthToPrice?.amount / synthFromPrice?.amount;
                                const newSynthFromFloat = utils.parseUnits(
                                    (priceQ * parseFloat(newSynthToAmount.toHumanString(18))).toString(),
                                    18
                                );
                                setSynthFromAmount(new Amount(newSynthFromFloat, 18));
                            }
                        }
                        value={synthToAmount.toHumanString(18)}
                    />
                    <InputGroup.Button className="selector-in-input">
                        <SelectPicker
                            size="sm"
                            label="Synth"
                            data={
                                (availableSynths ?? []).map((elem) => ({
                                    label: elem.fullName,
                                    value: elem.address
                                }))
                            }
                            // style={{ width: 300, minWidth: 250, }}
                            onChange={(val) => {
                                setToSynth(val)
                                setSynthToAmount(new Amount(BigNumber.from(0), 18))
                                setSynthFromAmount(new Amount(BigNumber.from(0), 18))
                            }}
                            defaultValue={availableSynths?.[availableSynths.length - 1]?.address}
                        />
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: {synthToBalance?.toHumanString(5)} (price: {synthToPrice?.toHumanString(6)}$)</Form.HelpText>
            </Form.Group>

            <br />
            <Button
                color="yellow"
                appearance="ghost"
                block
                style={{ marginBottom: 7, borderWidth: 2 }}
                onClick={async () => swapCallback()}
            >
                <b>Swap</b>
            </Button>
            <Form.HelpText>
                Price: 2323.33 ({availableSynths?.find(elem => elem.address === toSynth)?.fullName} in {availableSynths.find(elem => elem.address === fromSynth)?.fullName})
            </Form.HelpText>
        </Panel>
    );
};

const ActiveOrdersTable: NextComponentType = () => {
    return (
        <Table
            rowHeight={60}
            autoHeight
            style={{ borderRadius: 10 }}
            cellBordered
            virtualized
            data={ActivePositionsPlaceholder}
        >
            <Table.Column
                verticalAlign="middle"
                width={170}
                align="left"
                fixed
                flexGrow={1}
            >
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.Cell dataKey="name" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={100} flexGrow={1}>
                <Table.HeaderCell>Kind</Table.HeaderCell>
                <Table.Cell dataKey="kind" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={200} flexGrow={1}>
                <Table.HeaderCell>Current Price</Table.HeaderCell>
                <Table.Cell dataKey="current_price" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.Cell dataKey="amount" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                <Table.HeaderCell>Amount rUSD</Table.HeaderCell>
                <Table.Cell dataKey="amount_rusd" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1}>
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.Cell dataKey="amount_rusd">
                    <Button
                        style={{ borderWidth: 2 }}
                        color="red"
                        appearance="ghost"
                        block
                    >
                        Sell
                    </Button>
                </Table.Cell>
            </Table.Column>
        </Table>
    );
};


const Skew: NextComponentType = ({synthAddress, ...props}: {synthAddress: string}) => {
    const networkProvider = React.useContext(NetworkContext);
    const totalShorts = networkProvider.totalShorts(synthAddress);
    const totalLongs = networkProvider.totalLongs(synthAddress);

    const skew = parseFloat(totalShorts?.toHumanString(18))
        / (parseFloat(totalLongs?.toHumanString(18)) + parseFloat(totalShorts?.toHumanString(18)))
    ;

    return (
        <FlexboxGrid
            style={{ paddingTop: 5, paddingLeft: 25 }}
            justify="space-between"
        >
            <FlexboxGrid.Item style={{ paddingTop: 4 }} colspan={1}>
                <h5>Skew:</h5>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={21}>
                <Progress.Line
                    percent={Math.round((1 - skew) * 100)}
                    strokeColor="#1d5f5e"
                    trailColor="#82363a"
                />
            </FlexboxGrid.Item>
        </FlexboxGrid>
    );
}

const TradingView: NextComponentType = () => {
    const networkProvider = React.useContext(NetworkContext);
    const availableSynths: FrontendSynth[] | undefined = networkProvider.getAvailableSynths();
    const [tradingSynthAddress, setTradingSynthAddress] = React.useState<string>(availableSynths?.[availableSynths.length - 1]?.address ?? "0x0");

    return (
        <>
            <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item colspan={18}>
                    <FlexboxGrid
                        style={{ flexDirection: "column", alignItems: "center" }}
                        justify="space-between"
                    >
                        <FlexboxGrid.Item colspan={23}>
                            <FlexboxGrid>
                                <FlexboxGrid.Item colspan={8}>
                                    <SelectPicker
                                        size="lg"
                                        label="Synth"
                                        data={
                                            availableSynths.filter(elem => elem.symbol !== "rUSD").map((inst) => {
                                                return {
                                                    label: inst.fullName,
                                                    value: inst.address
                                                }
                                            })
                                        }
                                        style={{ width: 300, minWidth: 250 }}
                                        onChange={setTradingSynthAddress}
                                        // cleanable={false}
                                        defaultValue={tradingSynthAddress}
                                    />
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={16}>
                                <Skew synthAddress={tradingSynthAddress}/>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        </FlexboxGrid.Item>

                        <br />
                        <FlexboxGrid.Item colspan={23}>
                            <AdvancedRealTimeChart
                                height={780}
                                width="auto"
                                theme="dark"
                                symbol={availableSynths.find(inst => inst.address === tradingSynthAddress)?.tradingViewSymbol}
                                allow_symbol_change={false}
                                container_id={"tradingview_aaab4"}
                                // toolbar_bg="#282c34"
                            ></AdvancedRealTimeChart>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={6}>
                    {/* <TradeThePair /> */}
                    <SwapSynthes />
                    <br />
                    <LoanSynth />
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <div style={{marginTop: 10, marginBottom: 30}}>
                <FlexboxGrid justify="space-around">
                    <FlexboxGrid.Item colspan={11}>
                        <RepayBorrow />

                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={11}>
                        <WithdrawBorrows />
                    </FlexboxGrid.Item>
                </FlexboxGrid>
                <br />

            </div>
            <div style={{marginLeft: 40, marginRight: 40}}>
                <DepositBorrows />
            </div>

            <br />
        </>
    );
};

export default TradingView;
