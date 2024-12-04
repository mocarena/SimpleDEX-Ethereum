let provider;
let signer;
let dexContract;

const dexAddress = "0x3c4b3d20c12c641913984316183330342801708a";
const dexABI = [{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityAdded","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityRemoved","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"swapper","type":"address"},{"indexed":true,"internalType":"address","name":"fromToken","type":"address"},{"indexed":true,"internalType":"address","name":"toToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"inputAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"outputAmount","type":"uint256"}],"name":"TokensSwapped","type":"event"},
{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"reserveA","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"reserveB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"amountAIn","type":"uint256"}],"name":"swapAforB","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"uint256","name":"amountBIn","type":"uint256"}],"name":"swapBforA","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"tokenA","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"tokenB","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

async function connectWallet() {
    if (!window.ethereum) {
        alert("Por favor instala MetaMask para continuar.");
        return;
    }

    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        dexContract = new ethers.Contract(dexAddress, dexABI, signer);

        const account = await signer.getAddress();
        document.getElementById("status").textContent = "Conectado";
        document.getElementById("account").textContent = account;
        document.getElementById("connectButton").textContent = "Desconectar";
        
        // Manejo de cambios en la cuenta
        window.ethereum.on('accountsChanged', (accounts) => {
            document.getElementById("account").textContent = accounts[0];
        });

        // Manejo de cambios en la red
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload(); // Recarga la página si cambia la red
        });

    } catch (error) {
        console.error("Error al conectar la wallet:", error);
    }
}

async function disconnectWallet() {
    provider = null;
    signer = null;
    dexContract = null;
    document.getElementById("status").textContent = "Desconectado";
    document.getElementById("account").textContent = "";
    document.getElementById("connectButton").textContent = "Conectar";
}

// Llamar a connectWallet o disconnectWallet dependiendo del estado
document.getElementById("connectButton").addEventListener("click", () => {
    if (document.getElementById("connectButton").textContent === "Conectar") {
        connectWallet();
    } else {
        disconnectWallet();
    }
});

// Verifica si la wallet ya está conectada al cargar la página
window.addEventListener('load', () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.listAccounts().then(accounts => {
            if (accounts.length > 0) {
                document.getElementById("status").textContent = "Conectado";
                document.getElementById("account").textContent = accounts[0];
                document.getElementById("connectButton").textContent = "Desconectar";
            }
        });
    }
});

async function addLiquidity() {
    const amountA = document.getElementById("amountA").value;
    const amountB = document.getElementById("amountB").value;
    if (!amountA || !amountB) {
        alert("Introduce cantidades válidas.");
        return;
    }
    try {
        const tx = await dexContract.addLiquidity(amountA, amountB);
        await tx.wait();
        alert("Liquidez añadida exitosamente.");
    } catch (error) {
        console.error("Error al añadir liquidez:", error);
    }
}

async function withdrawLiquidity() {
    const amount = document.getElementById("withdrawAmount").value;
    if (!amount) {
        alert("Introduce una cantidad válida.");
        return;
    }
    try {
        const tx = await dexContract.removeLiquidity(amount);
        await tx.wait();
        alert("Liquidez retirada exitosamente.");
    } catch (error) {
        console.error("Error al retirar liquidez:", error);
    }
}

async function swapAforB() {
    const amount = document.getElementById("swapAmount").value;
    if (!amount) {
        alert("Introduce una cantidad válida.");
        return;
    }
    try {
        const tx = await dexContract.swapAforB(amount);
        await tx.wait();
        alert("Intercambio A por B completado.");
    } catch (error) {
        console.error("Error en el intercambio:", error);
    }
}

async function swapBforA() {
    const amount = document.getElementById("swapAmount").value;
    if (!amount) {
        alert("Introduce una cantidad válida.");
        return;
    }
    try {
        const tx = await dexContract.swapBforA(amount);
        await tx.wait();
        alert("Intercambio B por A completado.");
    } catch (error) {
        console.error("Error en el intercambio:", error);
    }
}

async function getTokenPrice() {
    try {
        const price = await dexContract.getPrice();
        document.getElementById("price").textContent = price.toString();
    } catch (error) {
        console.error("Error al obtener el precio del token:", error);
    }
}
