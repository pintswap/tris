const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils
const { padBuffer } = require('../utils/helpers')

use(require('chai-as-promised'));

const price = {value: ethers.utils.parseEther("0.27")}

describe('Public Sale', function () {
  let contract, whitelisted, notWhitelisted, merkleTree;
  // const arbitrarySigners = Array.from({ length: 1010 }, () => ethers.Wallet.createRandom())

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

    await contract.connect(whitelisted[0]).startMinting()
    await contract.connect(whitelisted[0]).startPublicMint()
  })

  it('should not allow minting if amount sent is less than 0.27 ETH', async () => {
    const invalidMerkleProof = merkleTree.getHexProof(padBuffer(notWhitelisted[0].address))
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof, { value: ethers.utils.parseEther("0.2") })).to.be.rejectedWith('Not enough ETH sent')
  })

  it("should allow any address to mint when public mint", async () => {
    const invalidMerkleProof = merkleTree.getHexProof(padBuffer(notWhitelisted[0].address))
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof, price)).to.not.be.rejected
  })

  it('should only allow one NFT per address', async () => {
    const invalidMerkleProof = merkleTree.getHexProof(padBuffer(notWhitelisted[0].address))
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof, price)).to.not.be.rejected;
    expect((await contract.balanceOf(notWhitelisted[0].address)).toString()).to.equal('1')
    await expect(contract.connect(notWhitelisted[0]).mint(invalidMerkleProof, price)).to.be.rejectedWith('User already claimed')
  })

  it("should only allow 1000 NFT's to be minted", async () => {
    expect((await contract.totalSupply()).toString()).to.equal('0');
    let arbitrarySigners = Array.from({ length: 1000 }, () => ethers.Wallet.createRandom())
    arbitrarySigners = arbitrarySigners.map(signer => signer.connect(ethers.provider))
    await Promise.all(arbitrarySigners.map(async signer => await notWhitelisted[4].sendTransaction({ to: signer.address, value: ethers.utils.parseEther("0.5") })))
    const minters = await Promise.all(arbitrarySigners.map(async signer => await contract.connect(signer).mint([], price)));
    expect((await contract.totalSupply()).toString()).to.equal('1000');
    await expect(contract.connect(notWhitelisted[3]).mint([], price)).to.be.rejectedWith('Exceeds token supply')
  }).timeout(100000);
})