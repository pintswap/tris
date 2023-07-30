'use strict';

const { MerkleTree } = require('merkletreejs')
const { padBuffer } = require('../utils/helpers')
const { ethers, deployments } = require('hardhat');
const { keccak256 } = ethers.utils
const { WHITELISTED } = require('../utils/whitelisted');

module.exports = async () => {
  const leaves = WHITELISTED.map(address => padBuffer(address))
  const merkleTree = new MerkleTree(leaves, keccak256, { sort: true })
  const merkleRoot = merkleTree.getHexRoot();

  const [ signer ] = await ethers.getSigners();
  console.log("Deploying TRIS with the account:", signer.address);
  
  const TRIS = await ethers.getContractFactory('TRIS');
  const tris = await TRIS.deploy(merkleRoot);
  console.log('Deployed TRIS to:', tris.address);
};
