const fs = require("fs")

const { config } = require("./config/hyperEvmTestnet")

//TODO verify config

let deployedContracts = JSON.parse(fs.readFileSync("./markets/deployedContracts.json"))

function getDeployedContractAddress(id){
    return deployedContracts[id]
}

async function setDeployedContractAddress(id, address){
    deployedContracts[id] = address
    deployedContractsChanged()
}

async function saveDeploymentInfo(name, data){
    //path.basename(__filename) + on = file.json
    fs.writeFileSync(`./deployments/${name}on`, JSON.stringify(data))

    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value
    }

    deployedContractsChanged()
}

function deployedContractsChanged(){
    fs.writeFileSync("./markets/deployedContracts.json", JSON.stringify(deployedContracts, null, 4))
}

module.exports = {
    config: config,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo
}