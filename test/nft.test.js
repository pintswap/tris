const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')

use(require('chai-as-promised'))

describe('WhitelistSale', function () {
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

  it('should get metadata', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await contract.mint(merkleProof);
    expect(await contract.tokenURI(ethers.utils.hexlify(1))).to.equal('ipfs://bafybeienialkdrppvdfdanzuiwnt45m4hhckayxrvvhktrrvmowwkwr45a/1')
  })

  it('should not allow non-whitelisted users to mint', async () => {
    const invalidMerkleProof = merkleTree.getHexProof(padBuffer(notWhitelisted[0].address))
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof)).to.be.rejectedWith('invalid merkle proof')
  })

  it('should allow whitelisted users to mint', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await expect(contract.mint(merkleProof)).to.not.be.rejected
  })

  it('should only allow one NFT per whitelisted address', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await expect(contract.mint(merkleProof)).to.not.be.rejected
    await expect(contract.mint(merkleProof)).to.be.rejectedWith('already claimed')
  })
})