const path = require("path");
const fs = require("fs");

const { config } = require(path.resolve(__dirname, "config/hyperEvmTestnet"));
const { verify } = require(path.resolve(__dirname, "../utils/verify"))

//TODO verify config

const deployedContracts = loadDeployedContracts();

function loadDeployedContracts(){
    try {
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, `./deployments/deployedContracts-${config.market.SymbolPrefix}.json`)));
    } catch (e){
        return {}
    }
}

function getDeployedContractAddress(id){
    return id ? deployedContracts[id] : deployedContracts;
}

async function setDeployedContractAddress(id, address){
    deployedContracts[id] = address;
    deployedContractsChanged();
}

async function saveDeploymentInfo(name, data){
    //path.basename(__filename) (=file.js) + on = file.json
    fs.writeFileSync(path.resolve(__dirname, `./deployments/contracts/${name}on`), JSON.stringify(data));

    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value;
    }

    deployedContractsChanged();
}

function deployedContractsChanged(){
    fs.writeFileSync(path.resolve(__dirname, `./deployments/deployedContracts-${config.market.SymbolPrefix}.json`), JSON.stringify(deployedContracts, null, 4));
}

module.exports = {
    config: config,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
};
