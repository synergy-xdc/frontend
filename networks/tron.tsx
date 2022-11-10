//   getTronweb() {
//     console.log("connect wallet operation");
//     var obj = setInterval(async () => {
//       if (window.tronWeb && !window.tronWeb.defaultAddress.base58) {
//         clearInterval(obj);
//         console.log("TronLink extension is installed but user not logged it");
//       }

//       if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
//         clearInterval(obj);
//         const tron_address = window.tronWeb.defaultAddress.base58;

//         window.localStorage.setItem("tron_address", tron_address);
//         console.log(`set localStorage item tron_address: ${tron_address}`);
//       }
//     }, 10);
//   }
