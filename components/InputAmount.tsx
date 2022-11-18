import Amount from "@/networks/base/amount";
import { NextComponentType } from "next/types";
import { BigNumber } from "ethers";
import { Form, InputGroup, InputNumber } from "rsuite";
import { ReactNode, FC } from "react";


const InputAmount: NextComponentType = ({title, value, setValue, decimalsShift, children}: {
    title: string,
    value: Amount,
    setValue: (_: Amount) => void,
    decimalsShift: number,
    children: ReactNode,
}) => {
    return (
        <Form.Group controlId="_">
            <Form.ControlLabel>{title}</Form.ControlLabel>
            <InputGroup style={{ marginTop: 5, marginBottom: 5 }}>
                <InputGroup.Button
                    onClick={() =>
                        setValue(
                            new Amount(
                                value.amount.sub(
                                    BigNumber.from(10).pow(value.decimals + decimalsShift)
                                ),
                                value.decimals
                            )
                        )
                    }
                >
                    -
                </InputGroup.Button>
                <InputNumber
                    className="no-arrows-input-number"
                    step={0.1}
                    value={value.toHumanString(18)}
                    onChange={(val) =>
                        setValue(
                            Amount.fromString(
                                typeof val == "string" ? val : val.toString(),
                                value.decimals
                            )
                        )
                    }
                />
                <InputGroup.Button
                    onClick={() =>
                        setValue(
                            new Amount(
                                value.amount.add(
                                    BigNumber.from(10).pow(value.decimals + decimalsShift)
                                ),
                                value.decimals
                            )
                        )
                    }
                >
                    +
                </InputGroup.Button>
            </InputGroup>
            {children}
        </Form.Group>
    );
}

export default InputAmount