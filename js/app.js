const getBalance = async () => {
  let balance = 0;
  if (MiniBillar.GameVars.gameData.walletAddress) {
    balance = await web3.eth.getBalance(
      "0x55d398326f99059ff775485246999027b3197955"
    );
    console.log("balance", balance);
  }
  return balance;
};

const connectWallet = async () => {
  console.log(MiniBillar.GameVars.gameData);
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    if (!MiniBillar.GameVars.gameData.walletAddress) {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const account = web3.eth.accounts;
      //Get the current MetaMask selected/active wallet
      const walletAddress = account.givenProvider.selectedAddress;
      console.log(`Wallet: ${walletAddress}`);
      const value = walletAddress;

      MiniBillar.GameVars.gameData.playerData.nick = value;
      MiniBillar.GameVars.gameData.walletAddress = walletAddress;
      MiniBillar.GameManager.writeGameData();
      MiniBillar.SplashState.currentInstance.playerAvatarContainer.updateName(
        value
      );
    } else {
      console.log("No wallet");
    }

    const balance = await getBalance();
    console.log(balance);
    MiniBillar.SplashState.currentInstance.balanceText.setText(balance);
  }
};

window.onload = () => {
  const game = new MiniBillar.Game();
};
