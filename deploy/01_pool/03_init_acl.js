const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

const aclAdmin = config.acl.aclAdmin
const poolAdmin = config.acl.poolAdmin
const emergencyAdmin = config.acl.emergencyAdmin

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));
    
    // 1. Set ACL admin at AddressesProvider
    await poolAddressesProvider.setACLAdmin(aclAdmin);

    // 2. Deploy ACLManager and setup administrators
    const ACLManager = await ethers.getContractFactory("ACLManager");
    const aclManager = await ACLManager.deploy(poolAddressesProvider.address)

    // 3. Setup ACLManager at AddressesProviderInstance
    await poolAddressesProvider.setACLManager(aclManager.address)

    // 4. Add PoolAdmin to ACLManager contract
    await aclManager.addPoolAdmin(poolAdmin)

    // 5. Add EmergencyAdmin  to ACLManager contract
    await aclManager.addEmergencyAdmin(emergencyAdmin)

    const isACLAdmin = await aclManager.hasRole(config.ZERO_BYTES_32, aclAdmin);
    const isPoolAdmin = await aclManager.isPoolAdmin(poolAdmin);
    const isEmergencyAdmin = await aclManager.isEmergencyAdmin(emergencyAdmin);

    if (!isACLAdmin) throw "[ACL][ERROR] ACLAdmin is not setup correctly";
    if (!isPoolAdmin) throw "[ACL][ERROR] PoolAdmin is not setup correctly";
    if (!isEmergencyAdmin) throw "[ACL][ERROR] EmergencyAdmin is not setup correctly";
    console.log("ACL Admin", aclAdmin);
    console.log("Pool Admin", poolAdmin);
    console.log("Emergency Admin", emergencyAdmin);

    saveDeploymentInfo(path.basename(__filename), {
        aclManager: aclManager.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
