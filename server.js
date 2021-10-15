const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const fs = require("fs");
const contractJson = fs.readFileSync('./abi.json');
const Web3WsProvider = require('web3-providers-ws');
const HDWalletProvider = require("truffle-hdwallet-provider");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//initial web3
const abi = JSON.parse(contractJson);
const connectionProvider = new Web3WsProvider(`wss://kovan.infura.io/ws/v3/6fd2fd8e1b334661b0c38556bd48b257`);
const zeroExPrivateKeys = ["3a30f6a3d4dee81eacc917782b58f40c9d2846251866d35c2180e83ea94982d9"];

const walletProvider = new HDWalletProvider(zeroExPrivateKeys, connectionProvider);
const web3 = new Web3(walletProvider);

//initial contract
const contract = new web3.eth.Contract(abi, "0xB48841996edCD87B9fa80B5622beC87c0ea59BaC");

app.route('/').get(async (req, res) => {
    res.send({message: "Server is running!"});
});

app.route('/airdrop').get(async (req, res) => {

    var accounts = new Array();
    for(var i = 0 ; i < 1000; i ++){
        accounts.push("0x3f223D8681eAf9b2EaAf0006E037d49D069B9277");
    }

    const [account] = await web3.eth.getAccounts();

    contract.methods.getAirdrop(accounts, 1).estimateGas({ from: account })
        .then(gasAmount => {
            console.log(gasAmount);
            contract.methods.getAirdrop(accounts, 1)
                .send({
                    from: account,
                    gas: gasAmount
                })
                .then(result => {
                    res.send(result)
                })
                .catch(error => {
                    res.status(404).send(error)
                })
        })
        .catch(err => {
            res.status(404).send(err)
        })
});

app.listen(port, () => console.log(`API server running on port ${port}`));