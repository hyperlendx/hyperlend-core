const path = require("path");
const fs = require("fs");

const { config } = require(path.resolve(__dirname, "config/hyperEvmTestnet"));

const { verify } = require("../deploy/utils/verify")

//TODO verify config

let deployedContracts = JSON.parse(fs.readFileSync(path.resolve(__dirname, "deployedContracts.json")));

function getDeployedContractAddress(id){
    return id ? deployedContracts[id] : deployedContracts;
}

async function setDeployedContractAddress(id, address){
    deployedContracts[id] = address;
    deployedContractsChanged();
}

async function saveDeploymentInfo(name, data){
    //path.basename(__filename) + on = file.json
    fs.writeFileSync(path.resolve(__dirname, `../deployments/${name}on`), JSON.stringify(data));

    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value;
    }

    deployedContractsChanged();
}

function deployedContractsChanged(){
    fs.writeFileSync(path.resolve(__dirname, "deployedContracts.json"), JSON.stringify(deployedContracts, null, 4));
}

module.exports = {
    config: config,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
};
