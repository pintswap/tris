const path = require("path");
const fs = require('fs');

(async () => {
    // Merkle Trees
    // const merkleDir = path.join(__dirname, '..', 'merkle', process.env.TEST ? 'localhost' : 'mainnet');
    // const leaves = WHITELISTED_ADDRESSES.map(account => padBuffer(account.address))
    // const tree = new MerkleTree(leaves, keccak256, { sort: true })
    // const merkleRoot = tree.getHexRoot()
    
    // Whitelist Merkle tree
    // const whitelistMerkleInput = require(path.join(merkleDir, 'input'));
    // fs.writeFileSync(path.join(merkleDir, 'output.json'), JSON.stringify(whitelistMerkleTree, null, 2));
    // console.log('\n==== NFT WHITELIST MERKLE CONFIGURED ====\n');
})().catch((err) => console.error(err))