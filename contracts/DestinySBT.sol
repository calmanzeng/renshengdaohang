// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DestinySBT - 命盘 Soulbound Token
 * @notice 将紫微斗数命盘信息铸造为不可转移的 Soulbound NFT
 * @dev 每个地址只能铸造一次，Token 不可转移
 */
contract DestinySBT {
    // ============ Errors ============
    error AlreadyMinted();
    error NotTokenOwner();
    error TransferNotAllowed();
    error InvalidBirthData();

    // ============ Events ============
    event DestinyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint16 birthYear,
        uint8 birthMonth,
        uint8 birthDay,
        uint8 birthHour,
        uint8 gender,
        string palaceHash
    );
    event DestinyBurned(uint256 indexed tokenId);

    // ============ Structs ============
    struct DestinyInfo {
        uint16 birthYear;      // 出生年
        uint8 birthMonth;      // 出生月
        uint8 birthDay;        // 出生日
        uint8 birthHour;       // 出生时辰 (0=早子时, 1-11=丑-亥, 12=晚子时)
        uint8 gender;          // 性别 (1=男, 2=女)
        string palaceHash;     // 命盘数据哈希 (IPFS/Arweave CID)
        uint256 mintedAt;      // 铸造时间
    }

    // ============ ERC-721 实现 (精简版, 无转移) ============
    string private _name;
    string private _symbol;

    // Token ID => 拥有者
    mapping(uint256 => address) private _owners;
    // 地址 => Token ID (每个地址最多一个)
    mapping(address => uint256) private _balances; // 地址命盘数量
    // Token ID => 命盘信息
    mapping(uint256 => DestinyInfo) private _destinies;

    uint256 private _nextTokenId;
    uint256 private _totalSupply;

    // ============ Constructor ============
    constructor() {
        _name = "Ziwei Destiny SBT";
        _symbol = "DESTINY";
        _nextTokenId = 1;
    }

    // ============ ERC-721 Metadata ============
    function name() public view returns (string memory) { return _name; }
    function symbol() public view returns (string memory) { return _symbol; }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Invalid address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function totalSupply() public view returns (uint256) { return _totalSupply; }

    // ============ Soulbound: 禁止转移 ============
    function transferFrom(address, address, uint256) external pure {
        revert TransferNotAllowed();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert TransferNotAllowed();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert TransferNotAllowed();
    }

    function approve(address, uint256) external pure {
        revert TransferNotAllowed();
    }

    function setApprovalForAll(address, bool) external pure {
        revert TransferNotAllowed();
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    // ============ 命盘查询 ============
    function getDestiny(uint256 tokenId) external view returns (DestinyInfo memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _destinies[tokenId];
    }

    function hasMinted(address user) external view returns (bool) {
        return _balances[user] > 0;
    }

    function getTokenId(address user) external view returns (uint256) {
        // 返回用户拥有命盘的数量
        return _balances[user];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        DestinyInfo storage info = _destinies[tokenId];
        
        // 构建 on-chain metadata
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeMetadata(info)
        ));
    }

    // ============ 铸造命盘 ============
    function mintDestiny(
        uint16 birthYear,
        uint8 birthMonth,
        uint8 birthDay,
        uint8 birthHour,
        uint8 gender,
        string calldata palaceHash
    ) external returns (uint256) {
        // 同一地址可铸造多个命盘
        // (已移除单次限制)
        
        // 基本数据校验
        if (birthYear < 1900 || birthYear > 2100) revert InvalidBirthData();
        if (birthMonth < 1 || birthMonth > 12) revert InvalidBirthData();
        if (birthDay < 1 || birthDay > 31) revert InvalidBirthData();
        if (birthHour > 12) revert InvalidBirthData();
        if (gender < 1 || gender > 2) revert InvalidBirthData();
        if (bytes(palaceHash).length == 0) revert InvalidBirthData();

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;
        _totalSupply++;

        _destinies[tokenId] = DestinyInfo({
            birthYear: birthYear,
            birthMonth: birthMonth,
            birthDay: birthDay,
            birthHour: birthHour,
            gender: gender,
            palaceHash: palaceHash,
            mintedAt: block.timestamp
        });

        emit DestinyMinted(tokenId, msg.sender, birthYear, birthMonth, birthDay, birthHour, gender, palaceHash);

        return tokenId;
    }

    // ============ 销毁命盘 (仅限本人) ============
    function burn(uint256 tokenId) external {
        if (_owners[tokenId] != msg.sender) revert NotTokenOwner();
        
        delete _destinies[tokenId];
        delete _owners[tokenId];
        delete _balances[msg.sender];
        _totalSupply--;

        emit DestinyBurned(tokenId);
    }

    // ============ 通缩版 Base64 Metadata ============
    function _encodeMetadata(DestinyInfo memory info) private pure returns (string memory) {
        string memory genderStr = info.gender == 1 ? "Male" : "Female";
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(abi.encodePacked(
                '{"name":"Ziwei Destiny",',
                '"description":"Personal Ziwei Doushu destiny chart, forever on-chain.",',
                '"attributes":[',
                '{"trait_type":"Birth Year","value":', _uint2str(info.birthYear), '},',
                '{"trait_type":"Birth Month","value":', _uint2str(info.birthMonth), '},',
                '{"trait_type":"Birth Day","value":', _uint2str(info.birthDay), '},',
                '{"trait_type":"Birth Hour","value":', _uint2str(info.birthHour), '},',
                '{"trait_type":"Gender","value":"', genderStr, '"},',
                '{"trait_type":"Palace Hash","value":"', info.palaceHash, '"}',
                ']}'
            ))
        ));
    }

    // ============ Utilities ============
    function _uint2str(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _base64Encode(bytes memory data) private pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 pos;
        uint256 i;
        for (i = 0; i + 3 <= data.length; i += 3) {
            uint256 b0 = uint8(data[i]);
            uint256 b1 = uint8(data[i + 1]);
            uint256 b2 = uint8(data[i + 2]);
            
            result[pos] = bytes(table)[b0 >> 2];
            result[pos + 1] = bytes(table)[((b0 & 0x03) << 4) | (b1 >> 4)];
            result[pos + 2] = bytes(table)[((b1 & 0x0f) << 2) | (b2 >> 6)];
            result[pos + 3] = bytes(table)[b2 & 0x3f];
            pos += 4;
        }
        
        if (i == data.length - 1) {
            uint256 lb0 = uint8(data[i]);
            result[pos] = bytes(table)[lb0 >> 2];
            result[pos + 1] = bytes(table)[(lb0 & 0x03) << 4];
            result[pos + 2] = "=";
            result[pos + 3] = "=";
        } else if (i == data.length - 2) {
            uint256 lb0 = uint8(data[i]);
            uint256 lb1 = uint8(data[i + 1]);
            result[pos] = bytes(table)[lb0 >> 2];
            result[pos + 1] = bytes(table)[((lb0 & 0x03) << 4) | (lb1 >> 4)];
            result[pos + 2] = bytes(table)[(lb1 & 0x0f) << 2];
            result[pos + 3] = "=";
        }
        
        return string(result);
    }
}
