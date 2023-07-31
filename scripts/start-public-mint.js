'use strict';

const { ethers, deployments, network } = require('hardhat');
const { TRIS } = require('../utils/deployments');

(async () => {
    const [ signer ] = await ethers.getSigners();
    console.log("Deployed TRIS with the account:", signer.address);
    console.log("Network", network.name)

    const contract = new ethers.Contract(
        TRIS[network.name], 
        ['function startPublicMint()', 'function startMinting()'],
        ethers.provider
    )

    await contract.connect(signer).startPublicMint()
})().catch((err) => console.error(err))