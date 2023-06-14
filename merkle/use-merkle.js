const MerkleTree = require("./merkle-tree");
const { ethers } = require("ethers");
const { Buffer } = require('buffer');
const BalanceTree = require("./balance-tree");
const { parseBalanceMap } = require("./parse-balance-map");

function genLeaf(address, value) {
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(['address', 'uint256'], [address, value])
            .slice(2),
        'hex'
    )
}

function balanceTreeFriendly(airdropList, decimals) {
    const list = [];
    Object.entries(airdropList).map((v) => {
        list.push({ account: v[0], amount: ethers.utils.parseUnits(v[1], decimals) })
    })
    return list;
}

function useMerkleGenerator(merkleConfig) {
    const balanceTree = new BalanceTree(balanceTreeFriendly(merkleConfig.airdrop, merkleConfig.decimals));
    const merkleTree = new MerkleTree(
        Object.entries(merkleConfig.airdrop).map(([address, tokens]) =>
            genLeaf(
                ethers.utils.getAddress(address),
                ethers.utils.parseUnits(tokens.toString(), merkleConfig.decimals)
            )
        )
    );
    const hexRoot = balanceTree.getHexRoot();

    // Create merkle result json for client
    const merkleResult = parseBalanceMap(merkleConfig.airdrop);

    return merkleResult;
}

module.exports = {
    useMerkleGenerator
}
