const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

const aclAdmin = config.acl.aclAdmin
const poolAdmin = config.acl.poolAdmin
const emergencyAdmin = config.acl.emergencyAdmin

async function main() {
    const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")
    if (poolAddressesProviderAddress.length == 0) throw new Error(`missing poolAddressesProvider address`)
      
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(poolAddressesProviderAddress);
    
    // 1. Set ACL admin at AddressesProvider
    await poolAddressesProvider.setACLAdmin(aclAdmin);
    console.log(`acl admin set to ${aclAdmin}`)

    // 2. Deploy ACLManager and setup administrators
    const ACLManager = await ethers.getContractFactory("ACLManager");
    const aclManager = await ACLManager.deploy(poolAddressesProvider.address)
    console.log(`aclManager deployed to ${aclManager.address}`)

    // 3. Setup ACLManager at AddressesProviderInstance
    await poolAddressesProvider.setACLManager(aclManager.address)
    console.log(`ACLManager set at poolAddressesProvider to ${aclManager.address}`)

    // 4. Add PoolAdmin to ACLManager contract
    await aclManager.addPoolAdmin(poolAdmin)
    console.log(`PoolAdmin set to ${poolAdmin}`)

    // 5. Add EmergencyAdmin  to ACLManager contract
    await aclManager.addEmergencyAdmin(emergencyAdmin)
    console.log(`EmergencyAdmin set to ${emergencyAdmin}`)

    const isACLAdmin = await aclManager.hasRole(config.ZERO_BYTES_32, aclAdmin);
    const isPoolAdmin = await aclManager.isPoolAdmin(poolAdmin);
    const isEmergencyAdmin = await aclManager.isEmergencyAdmin(emergencyAdmin);

    if (!isACLAdmin) throw "CLAdmin is not setup correctly";
    if (!isPoolAdmin) throw "PoolAdmin is not setup correctly";
    if (!isEmergencyAdmin) throw "EmergencyAdmin is not setup correctly";

    saveDeploymentInfo(path.basename(__filename), {
        aclManager: aclManager.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
