// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ERC721Permit} from "./erc721/ERC721Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TRIS is ERC721Permit, Ownable {
  using MerkleProof for bytes32[];

  bool private whitelistMintStarted;
  bytes32 public whitelistMerkleRoot;
  uint256 public cap = uint256(1000);

  mapping (uint256 => uint256) public nonces;
  string public __baseURI;
  function setBaseURI(string memory _uri) public onlyOwner {
    _setBaseURI(_uri);
  }
  function _setBaseURI(string memory _uri) internal {
    __baseURI = _uri;
  }
  function _baseURI() internal override view returns (string memory _uri) {
    _uri = __baseURI;
  }
  function version() public pure returns (string memory) { return "1"; }
  function setCap(uint256 _cap) public onlyOwner {
    cap = _cap;
  }

  constructor() ERC721Permit("TRIS", "TRIS", "1") Ownable() {
    _setBaseURI("ipfs://bafybeiezpbqq6favps74erwn35ircae2xqqdmczxjs7imosdkn6ahmuxme/");
  }

  // ===== Modifiers =====
  modifier whenWhitelistMint() {
    require(whitelistMintStarted, "!started");
    _;
  }
  mapping (address => uint256) public whitelistMinted;

  // === Minters ===
  function whitelistMint(
    address _to,
    uint256 _amountAllocated,
    uint256 _amountToMint,
    bytes32[] memory proof
  ) external payable whenWhitelistMint {
    require(isAddressWhitelisted(proof, _to, _amountAllocated));
    uint256 minted = whitelistMinted[_to];
    require(minted + _amountToMint <= _amountAllocated, "!allocated");
    whitelistMinted[_to] += _amountToMint;
    uint256 start = totalSupply();
    uint256 end = start + _amountAllocated;
    require(end <= cap, "!cap");
    for (uint256 i = start; i < end; i++) {
      _mint(_to, i);
    }
  }
  function mint(address _to, uint256 _tokenId) public onlyOwner {
    require(totalSupply() < cap, "!cap");
    _mint(_to, _tokenId);
  }

  // === Checks ===
  function isWhitelistActive() external view returns (bool) {
    return whitelistMintStarted;
  }

  function isAddressWhitelisted(
    bytes32[] memory proof,
    address _to,
    uint256 _amount
  ) internal view returns (bool) {
    return proof.verify(whitelistMerkleRoot, keccak256(abi.encodePacked(_to, _amount)));
  }

  // === Starters ===
  function startWhitelistMint() public onlyOwner {
    whitelistMintStarted = true;
  }

  function setWhitelistMerkleRoot(bytes32 value) public onlyOwner {
    whitelistMerkleRoot = value;
  }

  // === General ===
  function _getAndIncrementNonce(uint256 _tokenId) internal override virtual returns (uint256) {
    uint256 nonce = nonces[_tokenId];
    nonces[_tokenId]++;
    return nonce;
  }
}
  
