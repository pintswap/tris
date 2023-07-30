const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')

use(require('chai-as-promised'));

const price = {value: ethers.utils.parseEther("0.27")}

describe('Metadata', function () {
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

  it('should get token URI', async () => {
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address));
    await contract.connect(whitelisted[0]).startMinting();
    await contract.mint(merkleProof, price);
    expect(await contract.tokenURI(ethers.utils.hexlify(1))).to.equal('ipfs://bafybeienialkdrppvdfdanzuiwnt45m4hhckayxrvvhktrrvmowwkwr45a/1')
  })

  it('should display if public mint is enabled', async () => {
    expect(await contract.publicMint()).to.equal(false);
    await contract.connect(whitelisted[0]).startPublicMint();
    expect(await contract.publicMint()).to.equal(true);
  })

  it('should display if minting is enabled', async () => {
    expect(await contract.mintingEnabled()).to.equal(false);
    await contract.connect(whitelisted[0]).startMinting();
    expect(await contract.mintingEnabled()).to.equal(true);
  })

  it('should display total supply', async () => {
    expect((await contract.totalSupply()).toString()).to.equal('0');
    const merkleProof = merkleTree.getHexProof(padBuffer(whitelisted[0].address))
    await contract.connect(whitelisted[0]).startMinting();
    await contract.mint(merkleProof, price);
    expect((await contract.totalSupply()).toString()).to.equal('1');
  })
})