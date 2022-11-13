enum TXState {
    AwaitWalletConfirmation,
    WalletConfirmationDeclined,
    Broadcasting,
    EVMError,
    Success,
    Done
}

export default TXState;
