'use strict';

const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')
const { ethers, deployments } = require('hardhat');
const { WHITELISTED } = require('../utils/whitelisted');

module.exports = async () => {
  const leaves = WHITELISTED.map(address => padBuffer(address))
  const merkleTree = new MerkleTree(leaves, keccak256, { sort: true })
  const merkleRoot = merkleTree.getHexRoot();

  const [ signer ] = await ethers.getSigners();
  console.log("Deploying TRIS with the account:", signer.address);
  
  await deployments.deploy(merkleRoot, {
    contractName: 'TRIS',
    args: [],
    from: await signer.getAddress()
  });
  const wock = await ethers.getContract('TRIS');
  console.log('Deployed TRIS to:', wock.address);
};
