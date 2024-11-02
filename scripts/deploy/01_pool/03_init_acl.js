const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    const aclAdmin = config.acl.aclAdmin
    const poolAdmin = config.acl.poolAdmin
    const emergencyAdmin = config.acl.emergencyAdmin

    const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")
    if (poolAddressesProviderAddress.length == 0) throw new Error(`missing poolAddressesProvider address`)
      
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(poolAddressesProviderAddress);
    
    // 1. Set ACL admin at AddressesProvider
    await poolAddressesProvider.setACLAdmin(aclAdmin);
    console.log(`acl admin set to ${aclAdmin}`)

    // 2. Deploy ACLManager and setup administrators
    const ACLManager = await ethers.getContractFactory("ACLManager");
    const aclManager = await ACLManager.deploy(poolAddressesProvider.target)
    console.log(`aclManager deployed to ${aclManager.target}`)
    await verify(aclManager.target, [poolAddressesProvider.target])

    // 3. Setup ACLManager at AddressesProviderInstance
    await poolAddressesProvider.setACLManager(aclManager.target)
    console.log(`ACLManager set at poolAddressesProvider to ${aclManager.target}`)

    // 4. Add PoolAdmin to ACLManager contract
    await aclManager.addPoolAdmin(poolAdmin)
    console.log(`PoolAdmin set to ${poolAdmin}`)

    // 5. Add EmergencyAdmin  to ACLManager contract
    await aclManager.addEmergencyAdmin(emergencyAdmin)
    console.log(`EmergencyAdmin set to ${emergencyAdmin}`)

    saveDeploymentInfo(path.basename(__filename), {
        aclManager: aclManager.target
    })

    const isACLAdmin = await aclManager.hasRole(config.ZERO_BYTES_32, aclAdmin);
    const isPoolAdmin = await aclManager.isPoolAdmin(poolAdmin);
    const isEmergencyAdmin = await aclManager.isEmergencyAdmin(emergencyAdmin);

    if (!isACLAdmin) throw "ACLAdmin is not setup correctly";
    if (!isPoolAdmin) throw "PoolAdmin is not setup correctly";
    if (!isEmergencyAdmin) throw "EmergencyAdmin is not setup correctly";
}

module.exports = main