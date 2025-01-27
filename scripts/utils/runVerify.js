const fs = require('fs');
const path = require('path');
const { verify } = require("./verify")

const directoryPath = path.join(__dirname, '../mainnet-deploy/verifications');

main()

async function main(){
    try {
        const files = fs.readdirSync(directoryPath);
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

        jsonFiles.forEach(async (file) => {
            const filePath = path.join(directoryPath, file);
            const data = fs.readFileSync(filePath, 'utf8');

            try {
                const json = JSON.parse(data);
                await verify(json.address, json.constructorArguments, json.libraries, { verificationDataDir: null, verificationDataPath: null }, false)
            } catch (parseError) {
                console.error(`Error parsing JSON from file: ${file}`, parseError);
            }
        });
    } catch (err) {
        console.error('Unable to scan directory or read files:', err);
    }
}