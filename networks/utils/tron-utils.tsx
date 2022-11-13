// import { BigNumber } from "./helper";

const DATA_LEN = 64;
export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const triggerSmartContract = async (
  address: any,
  functionSelector: any,
  options: any = {},
  parameters: any = []
) => {
  try {
    const tronweb = window.tronWeb;
    const transaction = await tronweb.transactionBuilder.triggerSmartContract(
      address,
      functionSelector,
      // options,
      {
        shouldPollResponse: true, // Only used for sign()
      },
      // Object.assign({ shouldPollResponse: true }, options),
      parameters
    );

    if (!transaction.result || !transaction.result.result) {
      throw new Error(
        "Unknown trigger error: " + JSON.stringify(transaction.transaction)
      );
    }
    return transaction;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const sign = async (transaction: any) => {
  try {
    const tronweb = window.tronWeb;
    const signedTransaction = await tronweb.trx.sign(transaction.transaction);
    return signedTransaction;
  } catch (error: any) {
    console.log(error, "signerr");
    throw new Error(error);
  }
};

export const sendRawTransaction = async (signedTransaction: any) => {
  try {
    const tronweb = window.tronWeb;
    const result = await tronweb.trx.sendRawTransaction(signedTransaction);
    return result;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const view = async (
  address: any,
  functionSelector: any,
  parameters = [],
  isDappTronWeb = true
) => {
  try {
    const tronweb = window.tronWeb;
    const result = await tronweb.transactionBuilder.triggerSmartContract(
      address,
      functionSelector,
      { _isConstant: true },
      parameters
    );
    return result && result.result ? result.constant_result : [];
  } catch (error: any) {
    console.log(
      `view error ${address} - ${functionSelector}`,
      error.message ? error.message : error
    );
    return [];
  }
};

export const getTrxBalance = async (address: any, isDappTronWeb = false) => {
  try {
    const tronWeb = window.tronWeb;
    const balance = await tronWeb.trx.getBalance(address);
    return {
      //   balance: BigNumber(balance),
      balance: balance,
      success: true,
    };
  } catch (err) {
    console.log(`getPairBalance: ${err}`, address);
    return {
      //   balance: BigNumber(0),
      balance: 0,
      success: false,
    };
  }
};

// export const getTransactionInfo = (tx) => {
//   const tronWeb = mainchain;
//   return new Promise((resolve, reject) => {
//     tronWeb.trx.getConfirmedTransaction(tx, (e, r) => {
//       if (!e) {
//         resolve(r);
//       } else {
//         reject(e, null);
//       }
//     });
//   });
// };

// export const getTRC20Balance = async (tokenAddress, userAddress) => {
//   console.log("params of getbalance: ", userAddress, tokenAddress);
//   const result = await view(tokenAddress, "balanceOf(address)", [
//     { type: "address", value: userAddress },
//   ]);
//   let value = BigNumber(0);
//   let success = false;

//   if (result.length) {
//     value = new BigNumber(result[0].slice(0, DATA_LEN), 16);
//     success = true;
//   }

//   return {
//     value,
//     success,
//   };
// };
