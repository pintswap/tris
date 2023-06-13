'use strict';

const { ethers, deployments } = require('hardhat');

module.exports = async () => {
  const [ signer ] = await ethers.getSigners();
  await deployments.deploy('TRIS', {
    contractName: 'TRIS',
    args: [],
    from: await signer.getAddress()
  });
  const wock = await ethers.getContract('TRIS');
  console.log('deployed TRIS');
};
