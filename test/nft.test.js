const hre = require('hardhat');
const { ethers } = require("ethers");
const { expect } = require("chai");

const { claims: WHITELIST_CLAIMS, merkleRoot: WHITELIST_ROOT } = require("../merkle/localhost/tris-whitelist.json");
const ethToSend = { value: ethers.utils.parseEther('1') }

describe('TRIS.sol', () => {
  let contract, owner, buyer1, buyer1Address;

  before(async () => {
    await hre.deployments.fixture();
    [owner, buyer1] = await hre.ethers.getSigners();
    buyer1Address = await buyer1.getAddress();
    const nftcontract = await hre.deployments.get("TRIS");
    contract = new ethers.Contract(
      nftcontract.address,
      nftcontract.abi,
      owner
    );
    await contract.connect(owner).startWhitelistMint();
    await contract.connect(owner).setWhitelistMerkleRoot(WHITELIST_ROOT);
  })

	/*
  it('should get metadata', async () => {
    console.log(await contract.tokenURI('0x01'));
  })
  */

  it('should not be able to #whitelistMint if not on whitelist', async () => {
    expect(await contract.isWhitelistActive()).to.equal(true);
    const tx = contract.connect(buyer1).whitelistMint(
//      WHITELIST_CLAIMS[buyer1Address].index,
      buyer1Address,
      WHITELIST_CLAIMS[buyer1Address].amount,
      ethers.utils.hexlify(1),
      WHITELIST_CLAIMS[buyer1Address].proof,
      ethToSend
    )
    console.log("#whitelistMint", await tx)
  })
	/*
  it('should not be able to #whitelistMint if not sending enough ETH', async () => {
    expect(await contract.isWhitelistActive()).to.equal(true);
    const tx = contract.connect(buyer1).whitelistMint(
      WHITELIST_CLAIMS[buyer1Address].index,
      buyer1Address,
      ethers.utils.hexlify(1),
      WHITELIST_CLAIMS[buyer1Address].proof,
      ethToSend
    )
    console.log("#whitelistMint", await tx)
  })

  it('should #whitelistMint the correct amount of nfts', async () => {
    expect(await contract.isWhitelistActive()).to.equal(true);
    const tx = contract.connect(buyer1).whitelistMint(
      WHITELIST_CLAIMS[buyer1Address].index,
      await buyer1.getAddress(),
      ethers.utils.hexlify(1),
      WHITELIST_CLAIMS[buyer1Address].proof,
      ethToSend
    )
    console.log("#whitelistMint", await tx)
  })
  */
});
