const { useMerkleGenerator } = require("../merkle/use-merkle");
const path = require("path");
const fs = require('fs');

(async () => {
  // Merkle Trees
  const merkleDir = path.join(__dirname, '..', 'merkle', process.env.TEST ? 'localhost' : 'mainnet');

  // Whitelist Merkle tree
  const whitelistMerkleInput = require(path.join(merkleDir, 'tris-input'));
  const whitelistMerkleTree = useMerkleGenerator(whitelistMerkleInput);
  fs.writeFileSync(path.join(merkleDir, 'tris-whitelist.json'), JSON.stringify(whitelistMerkleTree, null, 2));
  console.log('\n---- NFT WHITELIST MERKLE CONFIGURED ----');
})().catch((err) => console.error(err))