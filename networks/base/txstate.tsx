enum TXState {
    AwaitWalletConfirmation,
    WalletConfirmationDeclined,
    Broadcasting,
    EVMError,
    Success,
    Done
}

export interface WritingState {
    errorMsg: string | null,
    callback: () => void
}

export default TXState;
