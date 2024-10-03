const path = require("path");
const fs = require("fs");

async function verify(address, args, libraries){
    const params = {
        address: address,
        constructorArguments: args,
    }

    if (libraries){
        params.libraries = libraries
    }

    try {
        console.log(`verifying ${address} with args: ${args}`);
        await storeVerificationData(
            path.resolve(__dirname, `../../deployments/verifications`),
            path.resolve(__dirname, `../../deployments/verifications/${address}.json`),
            JSON.stringify(params, null, 4)
        );
        await hre.run("verify:verify", params);
    } catch (e) {
        console.log(`verification failed`);
        console.log(e);
    }
}

async function storeVerificationData(dir, filePath, data){
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data);
}

module.exports.verify = verify;
