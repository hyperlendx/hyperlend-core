const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { prepareEnv } = require("./utils/setup")

/*
Available contract IDs:
  mockERC20
  mockHyperEvmOracleProxy
  poolAddressesProviderRegistry
  supplyLogic
  borrowLogic
  liquidationLogic
  bridgeLogic
  eModeLogic
  configuratorLogic
  flashLoanLogic
  poolLogic
  poolAddressesProvider
  protocolDataProvider
  pool
  poolConfigurator
  reservesSetupHelper
  aclManager
  oracle
  poolProxy
  l2Encoder
  poolConfiguratorProxy
  aToken
  delegationAwareAToken
  variableDebtToken
  stableDebtToken
  rateStrategyVolatileOne
  defaultReserveInterestRateStrategy
  seedAmountsHolder

Note: poolProxy is the main entry-point, while pool is the implementation
*/

describe("HyperLendCore", function () {
    async function prepareEnvFixture(){
        const [owner, user] = await ethers.getSigners();
        const env = await prepareEnv()

        await env.setupEnv()

        return { env, owner, user }
    }

    it("Should deploy & configure & supply to the market", async function () {
        const { env, owner, user } = await loadFixture(prepareEnvFixture)

        const mockToken = await env.getContractInstanceById("mockERC20")
        const poolProxy = await env.getContractInstanceById("poolProxy")
        
        await mockToken.connect(owner).transfer(user.address, "1000000")
        await mockToken.connect(user).approve(poolProxy.target, "1000000")
        await poolProxy.connect(user).supply(mockToken.target, "1000000", user.address, "0")

        let aTokenAddress = (await poolProxy.getReserveData(mockToken.target))[8]
        let aToken = await env.getATokenInstance(aTokenAddress)

        expect(await poolProxy.getReservesList()).to.deep.equal([mockToken.target])
        expect(Number(await aToken.balanceOf(user.address))).to.equal(1000000)
    });
});