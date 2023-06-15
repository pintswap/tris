//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { ERC721Permit } from "./erc721/ERC721Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract TRIS is ERC721Permit, Ownable {
  bytes32 immutable public merkleRoot;
  uint256 public nextTokenId;
  mapping(address => bool) public claimed;
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

  constructor(bytes32 _merkleRoot) ERC721Permit("TRIS", "TRIS", "1") Ownable() {
    merkleRoot = _merkleRoot;
    _setBaseURI("ipfs://bafybeienialkdrppvdfdanzuiwnt45m4hhckayxrvvhktrrvmowwkwr45a/");
  }

  function toBytes32(address addr) pure internal returns (bytes32) {
    return bytes32(uint256(uint160(addr)));
  }

  function mint(bytes32[] calldata merkleProof) public payable {
    require(claimed[msg.sender] == false, "already claimed");
    claimed[msg.sender] = true;
    require(MerkleProof.verify(merkleProof, merkleRoot, toBytes32(msg.sender)) == true, "invalid merkle proof");
    nextTokenId++;
    _mint(msg.sender, nextTokenId);
  }

  function adminMint(address _to, uint256 _tokenId) public onlyOwner {
    _mint(_to, _tokenId);
  }

  function _getAndIncrementNonce(uint256 _tokenId) internal override virtual returns (uint256) {
    uint256 nonce = nonces[_tokenId];
    nonces[_tokenId]++;
    return nonce;
  }
}