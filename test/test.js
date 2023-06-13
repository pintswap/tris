const hre = require('hardhat');
describe('TRIS.sol', () => {
  before(async () => {
    await hre.deployments.fixture();
    const wock = await hre.ethers.getContract('TRIS');
  });
  it('should get metadata', async () => {
    const wock = await hre.ethers.getContract('TRIS');
    console.log(await wock.tokenURI('0x01'));
  });
});
