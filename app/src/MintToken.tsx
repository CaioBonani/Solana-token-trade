import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';

import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer,
    Account,
    getMint,
    getAccount,
    createAssociatedTokenAccount
} from '@solana/spl-token';

import bs58 from 'bs58';
import ReactDOM from 'react-dom';
import React from 'react';

import './MintToken.css';

window.Buffer = window.Buffer || require("buffer").Buffer;

function MintToken() {

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const [pvtKey, setPvtKey] = React.useState('');
    const [pubKey, setPubKey] = React.useState('');
    const [tokenPubKey, setTokenKey] = React.useState('');
    const [amount, setAmount] = React.useState(0);


    let fromTokenAccount: Account;
    let mint: PublicKey;

    function pegarPvtKey() {
        const pvk = (document.getElementById("pvtKey") as HTMLInputElement).value;
        setPvtKey(pvk);
    }

    function pegarPubkey() {
        const pbk = (document.getElementById("pubKey") as HTMLInputElement).value;
        setPubKey(pbk);
    }

    function pegarToken() {
        const token = (document.getElementById("tokenKey") as HTMLInputElement).value;
        setTokenKey(token);
    }

    function pegarAmount() {
        const qtd = parseInt((document.getElementById("amount") as HTMLInputElement).value);
        setAmount(qtd);
    }

    async function testApi() {

        const amount = 1000000000;

        const pvtKeyDecoded = bs58.decode("3hy5sUta8NgU6M8K2kjSjCY48b8Wwd66rpJG2JZ1qhyPLGXt3R6cNEEZz9df666oLPJMKZnUxT5BkbVmXsDEJ3DD");
        const uInt8ArrayFromPvtKey = new Uint8Array(pvtKeyDecoded.buffer, pvtKeyDecoded.byteOffset, pvtKeyDecoded.byteLength / Uint8Array.BYTES_PER_ELEMENT);
        const fromWallet = Keypair.fromSecretKey(uInt8ArrayFromPvtKey);

        let from = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            new PublicKey("GUuXJ5mh8MqoAEsayC1okx71L9HjP2VGdspJZ1BqHvLv"),
            fromWallet.publicKey
        );

        console.log('Sending Wallet Token Account:'  + from.address.toBase58());

        let to = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            new PublicKey("GUuXJ5mh8MqoAEsayC1okx71L9HjP2VGdspJZ1BqHvLv"),
            new PublicKey("3LgXWHn9ZHtv7jgUk4Ei8JF35qonMjKkhr6VhTZgy5rK")
        );

        let from_a = from.address.toBase58();
        let to_a = to.address.toBase58();

        console.log('Receiving Wallet Token Account: ' + to.address.toBase58());

        fetch("https://localhost:8080", {
            method: "POST",
            headers: {
                "Allow-Control-Allow-Origin": "https://localhost/8080",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from_a, to_a, amount }),

        }).then(response => {
            console.log("Success:");

        }).catch((error) => {
            console.error("Error:", error);
        });
    }


    function handleClick() {
        pegarPvtKey();
        pegarPubkey();
        pegarToken();
        pegarAmount();
    }


    async function GetTokenAccount() {

        console.log('Sender Private Key: ' + pvtKey);
        console.log('Token Key: ' + tokenPubKey);
        console.log('Receiver Public Key: ' + pubKey);

        const pvtKeyDecoded = bs58.decode(pvtKey);
        const uInt8ArrayFromPvtKey = new Uint8Array(pvtKeyDecoded.buffer, pvtKeyDecoded.byteOffset, pvtKeyDecoded.byteLength / Uint8Array.BYTES_PER_ELEMENT);
        const fromWallet = Keypair.fromSecretKey(uInt8ArrayFromPvtKey);

        const tokenQueSeraTransferido = new PublicKey(tokenPubKey);

        mint = tokenQueSeraTransferido;

        console.log('Sender Public Key: ' + fromWallet.publicKey.toBase58());

        fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );

        console.log(`Wallet Token Account: ${fromTokenAccount.address.toBase58()}`);
    }

    async function checkBalance() {

        const mintInfo = await getMint(connection, mint);
        console.log(`How many ${mint.toBase58()} tokens exists: ${mintInfo.supply}`);
        alert(`How mayny ${mint.toBase58()} tokens exists: ${mintInfo.supply}`);

        const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
        console.log(`How many tokens the sender holds: ${tokenAccountInfo.amount}`);
        alert(`How many tokens the sender holds: ${tokenAccountInfo.amount}`);
    }

    async function sendToken() {

        const pvtKeyDecoded = bs58.decode(pvtKey);
        const uInt8ArrayFromPvtKey = new Uint8Array(pvtKeyDecoded.buffer, pvtKeyDecoded.byteOffset, pvtKeyDecoded.byteLength / Uint8Array.BYTES_PER_ELEMENT);
        const fromWallet = Keypair.fromSecretKey(uInt8ArrayFromPvtKey);

        const toWallet = new PublicKey(pubKey);

        GetTokenAccount();

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);
        console.log(`Receiver Token Account: ${toTokenAccount.address}`);

        const signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            amount * 1000000000
        );

        console.log(`Transaction Signature: ${signature}`);
        alert(`Transaction Signature: ${signature}`);
    }

    return (

        <div>
            <div id="barraSuperior">
                <table id="keys">
                    <tr>
                        <span id="area">Token-Area</span>
                        <td>
                        <button onClick={GetTokenAccount}>Get Token Account</button>
                        </td>
                        <td>
                        <button onClick={checkBalance}>Check balance</button>
                        </td>
                        <button onClick={sendToken}>Send token</button>
                        <td>
                        <button onClick={testApi}>Test API</button>
                        </td>
                    </tr>
                </table>
            </div>

            <div id="token">
                <br />
                <div id="area">Data</div>

                <input type="text" id="pvtKey" name="pvtKey" placeholder='Private Key'/>
                <p>Private Key: {pvtKey}</p>
            
                <input type="text" id="pubKey" name="pubKey" placeholder='Public Key' />
                <p>Public Key: {pubKey}</p>

                <input type="text" id="tokenKey" name="tokenKey" placeholder='Token Key' />
                <p>Token: {tokenPubKey}</p>

                <input type="text" id="amount" name="amount" placeholder='Amount' />
                <p>Amount: {amount}</p>

                <button id="botao" onClick={handleClick}>Save</button>

                <br />
                <br />
            </div>

        </div>
    );
}

export default MintToken;