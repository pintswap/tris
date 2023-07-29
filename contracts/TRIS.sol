//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { ERC721Permit } from "./erc721/ERC721Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract TRIS is ERC721Permit, Ownable {
  bytes32 immutable public merkleRoot;
  uint256 public nextTokenId;
  string public __baseURI;

  mapping(address => bool) public claimed;
  mapping (uint256 => uint256) public nonces;

  bool public isPublicMint = false;
  uint16 constant MAX_SUPPLY = 1000; 
  uint256 private PRICE = 0.27 ether; 

  constructor(bytes32 _merkleRoot) ERC721Permit("TRIS", "TRIS", "1") Ownable() {
    merkleRoot = _merkleRoot;
    _setBaseURI("ipfs://bafybeienialkdrppvdfdanzuiwnt45m4hhckayxrvvhktrrvmowwkwr45a/");
  }

  function version() public pure returns (string memory) { return "1"; }

  // URI
  function setBaseURI(string memory _uri) public onlyOwner {
    _setBaseURI(_uri);
  }
  function _setBaseURI(string memory _uri) internal {
    __baseURI = _uri;
  }
  function _baseURI() internal override view returns (string memory _uri) {
    _uri = __baseURI;
  }

  // Public Mint
  function startPublicMint() public onlyOwner {
    require(isPublicMint == false, "Public mint is already enabled");
    isPublicMint = true;
  }

  function publicMint() public view returns (bool) { return isPublicMint; }

  // Mint
  function mint(bytes32[] calldata merkleProof) public payable {
    require(msg.value >= PRICE, "Not enough ETH sent");
    require(nextTokenId < MAX_SUPPLY, "Exceeds token supply");
    require(claimed[msg.sender] == false, "User already claimed");
    if(!isPublicMint) {
      require(MerkleProof.verify(merkleProof, merkleRoot, toBytes32(msg.sender)) == true, "Invalid merkle proof");
    }
    claimed[msg.sender] = true;
    nextTokenId++;
    _mint(msg.sender, nextTokenId);
  }

  function adminMint(address _to, uint256 _tokenId) public onlyOwner {
    _mint(_to, _tokenId);
  }

  // Helpers
  function toBytes32(address addr) pure internal returns (bytes32) {
    return bytes32(uint256(uint160(addr)));
  }

  function _getAndIncrementNonce(uint256 _tokenId) internal override virtual returns (uint256) {
    uint256 nonce = nonces[_tokenId];
    nonces[_tokenId]++;
    return nonce;
  }
}