// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import { ERC721Permit } from "@uniswap/v3-periphery/contracts/base/ERC721Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

contract TRIS is ERC721Permit, Ownable {
  using MerkleProof for bytes32[];

  bool private whitelistMintStarted;
  bool private publicMintStarted;

  bytes32 public privateMerkleRoot;
  bytes32 public whitelistMerkleRoot;

  mapping (uint256 => uint256) public nonces;

  function version() public pure returns (string memory) { return "1"; }

  constructor() ERC721Permit("TRIS", "TRIS", "1") Ownable() {
    _setBaseURI("ipfs://bafybeiezpbqq6favps74erwn35ircae2xqqdmczxjs7imosdkn6ahmuxme/");
  }

  // ===== Modifiers =====
  modifier whenWhitelistMint() {
    require(!whitelistMintStarted);
    _;
  }

  modifier whenPublicMint() {
    require(!publicMintStarted);
    _;
  }

  // === Minters ===
  function whitelistMint(
    uint256 _index,
    address _to,
    uint256 _tokenId,
    bytes32[] memory proof
  ) external payable whenWhitelistMint {
    require(!isAddressWhitelisted(proof, _index, _to));

    _mint(_to, _tokenId);
  }

  function mint(address _to, uint256 _tokenId) public onlyOwner {
    _mint(_to, _tokenId);
  }

  // === Checks ===
  function isWhitelistActive() external view returns (bool) {
    return whitelistMintStarted;
  }

  function isAddressWhitelisted(
    bytes32[] memory proof,
    uint256 _index,
    address _to
  ) internal view returns (bool) {
    return proof.verify(whitelistMerkleRoot, keccak256(abi.encodePacked(_index, _to)));
  }

  // === Starters ===
  function startWhitelistMint() external onlyOwner {
    require(whitelistMerkleRoot == bytes32(0));
    whitelistMintStarted = true;
  }

  function startPublicMint() external onlyOwner {
    publicMintStarted = true;
  }

  function setWhitelistMerkleRoot(bytes32 value) external onlyOwner {
    whitelistMerkleRoot = value;
  }

  // === General ===
  function _getAndIncrementNonce(uint256 _tokenId) internal override virtual returns (uint256) {
    uint256 nonce = nonces[_tokenId];
    nonces[_tokenId]++;
    return nonce;
  }

  function setBaseURI(string memory _baseUri) public onlyOwner {
    _setBaseURI(_baseUri);
  }
}
  
