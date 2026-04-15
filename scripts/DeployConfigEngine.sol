// SPDX-License-Identifier: BUSL-1.1
  pragma solidity ^0.8.0;

  import {Script} from 'forge-std/Script.sol';
  import 'forge-std/console.sol';
  import {AaveV3HelpersBatchOne} from '../src/deployments/projects/aave-v3-batched/batches/AaveV3HelpersBatchOne.sol';
  import {ConfigEngineReport} from '../src/deployments/interfaces/IMarketReportTypes.sol';

  contract DeployConfigEngineOnly is Script {
    function run() external {
      address poolProxy                   = 0x00A89d7a5A02160f20150EbEA7a2b5E4879A1A8b;
      address poolConfiguratorProxy       = 0x8CB4310dD38F6fD59388C9DE225f328092bdC379;
      address defaultInterestRateStrategy = 0xD01E9AA0ba6a4a06E756BC8C79579E6cef070822;
      address aaveOracle                  = 0xC9Fb4fbE842d57EAc1dF3e641a281827493A630e;
      address rewardsController           = 0x2aF0d6754A58723c50b5e73E45D964bFDD99fE2F;
      address collector                   = 0xA9A7e0E91689C49bf9F2A15a768cAebBA6A5EEC5; // treasury or revenueSplitter
      address aTokenImpl                  = 0x410Aa1ab680B886c875e99a7A4bfaf188508a7A3;
      address vTokenImpl                  = 0x8158e5569475a443a5723ccaC462930F590449Ed;

      vm.startBroadcast();

      AaveV3HelpersBatchOne batch = new AaveV3HelpersBatchOne(
        poolProxy,
        poolConfiguratorProxy,
        defaultInterestRateStrategy,
        aaveOracle,
        rewardsController,
        collector,
        aTokenImpl,
        vTokenImpl
      );

      vm.stopBroadcast();

      ConfigEngineReport memory r = batch.getConfigEngineReport();
      console.log("configEngine:         ", r.configEngine);
      console.log("listingEngine:        ", r.listingEngine);
      console.log("eModeEngine:          ", r.eModeEngine);
      console.log("borrowEngine:         ", r.borrowEngine);
      console.log("collateralEngine:     ", r.collateralEngine);
      console.log("priceFeedEngine:      ", r.priceFeedEngine);
      console.log("rateEngine:           ", r.rateEngine);
      console.log("capsEngine:           ", r.capsEngine);
    }
  }
