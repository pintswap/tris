const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')

use(require('chai-as-promised'));

const price = {value: ethers.utils.parseEther("0.27")}

describe('Admin Functions', function () {
  let contract, whitelisted, notWhitelisted, merkleTree;
  
  beforeEach(async () => {
    const accounts = await hre.ethers.getSigners();
    whitelisted = accounts.slice(0, 5);
    notWhitelisted = accounts.slice(5, 10);

    const leaves = whitelisted.map(account => padBuffer(account.address))
    merkleTree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = merkleTree.getHexRoot()

    const Tris = await ethers.getContractFactory('TRIS')
    contract = await Tris.deploy(merkleRoot)
    await contract.deployed();
  })

  it('should only allow owner to start public mint', async () => {
    await expect(contract.connect(whitelisted[1]).startPublicMint()).to.be.rejected;
    await expect(contract.connect(whitelisted[0]).startPublicMint()).to.not.be.rejected;
  })

  it('should allow admin to mint NFT for free', async () => {
    await expect(contract.connect(whitelisted[0]).adminMint(notWhitelisted[0].address, 5)).to.not.be.rejected;
    expect ((await contract.balanceOf(notWhitelisted[0].address)).toString()).to.equal('1')
  })

  it('should not allow any user to use adminMint function', async () => {
    await expect(contract.connect(notWhitelisted[0]).adminMint(whitelisted[1].address, 5)).to.be.rejected;
    expect ((await contract.balanceOf(whitelisted[1].address)).toString()).to.equal('0')
  })

  it('should only allow contract owner to enable minting', async () => {
    expect(contract.connect(whitelisted[1]).startMinting()).to.be.rejected;
    expect(contract.connect(whitelisted[0]).startMinting()).to.not.be.rejected;
  })

  it('should set the owner to be the deployer of the contract', async () => {
    expect(await contract.owner()).to.equal(whitelisted[0].address)
  })
})