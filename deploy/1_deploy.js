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

  // Merkle Trees
  const merkleDir = path.join(__dirname, '..', 'merkle', process.env.TEST ? 'localhost' : 'mainnet');

  // Whitelist Merkle tree
  const whitelistMerkleInput = require(path.join(merkleDir, 'tris-input'));
  const whitelistMerkleTree = useMerkleGenerator(whitelistMerkleInput);
  fs.writeFileSync(path.join(merkleDir, 'tris-whitelist.json'), JSON.stringify(whitelistMerkleTree, null, 2));
  await wock.setWhitelistMerkleRoot(whitelistMerkleTree.merkleRoot);
  console.log('\n---- NFT WHITELIST MERKLE CONFIGURED ----');
};
