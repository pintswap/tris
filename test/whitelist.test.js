const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')

use(require('chai-as-promised'));

const price = {value: ethers.utils.parseEther("0.27")}

describe('Whitelist Sale', function () {
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
    await contract.deployed()
  })

  it('should not allow minting if amount sent is less than 0.27 ETH', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await expect(contract.mint(merkleProof, { value: ethers.utils.parseEther("0.2") })).to.be.rejectedWith('Not enough ETH sent')
  })

  it('should not allow non-whitelisted users to mint', async () => {
    const invalidMerkleProof = merkleTree.getHexProof(padBuffer(notWhitelisted[0].address))
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof, price)).to.be.rejectedWith('Invalid merkle proof')
  })

  it('should allow whitelisted users to mint', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await expect(contract.mint(merkleProof, price)).to.not.be.rejected
  })

  it('should only allow one NFT per whitelisted address', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await expect(contract.mint(merkleProof, price)).to.not.be.rejected
    await expect(contract.mint(merkleProof, price)).to.be.rejectedWith('User already claimed')
  })
})