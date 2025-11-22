// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ProjectRegistryOptimized is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    // Admin remains default role from AccessControl

    struct Project {
        // Do not store projectID string on-chain to save gas.
        string registrationCID;   // IPFS CID (small string)
        address registrar;
        bool verified;
        uint40 createdAt;         // enough for timestamps until year ~36813
        // padding to 32 bytes can be left for cheaper packing
    }

    // mapping keyed by bytes32(projectKey) == keccak256(projectID)
    mapping(bytes32 => Project) private projects;

    // indexed projectKey for efficient filtering; registrationCID not indexed (strings expensive)
    event ProjectRegistered(bytes32 indexed projectKey, address indexed registrar, uint40 createdAt, string registrationCID);

    constructor(address admin) {
        require(admin != address(0), "admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    /**
     * @notice Register a project by supplying the human projectID string; contract computes the key.
     * @dev This remains convenient but costs gas for keccak and the calldata string.
     */
    function registerProjectByID(string calldata projectID, string calldata registrationCID)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        // basic validations
        require(bytes(registrationCID).length != 0, "registrationCID empty");
        bytes32 key = keccak256(bytes(projectID));

        // ensure not exists
        // check that createdAt == 0 (default) to detect non-existence cheaply
        require(projects[key].createdAt == 0, "already exists");

        // store minimal data
        projects[key].registrationCID = registrationCID;
        projects[key].registrar = msg.sender;
        projects[key].verified = true;
        projects[key].createdAt = uint40(block.timestamp);

        emit ProjectRegistered(key, msg.sender, uint40(block.timestamp), registrationCID);
    }

    /**
     * @notice Lowest-gas registration: caller supplies precomputed key (keccak256(projectID) off-chain).
     * Recommended for production clients that can compute the key before sending tx.
     */
    function registerProjectByKey(bytes32 projectKey, string calldata registrationCID)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        require(bytes(registrationCID).length != 0, "registrationCID empty");
        require(projects[projectKey].createdAt == 0, "already exists");

        projects[projectKey].registrationCID = registrationCID;
        projects[projectKey].registrar = msg.sender;
        projects[projectKey].verified = true;
        projects[projectKey].createdAt = uint40(block.timestamp);

        emit ProjectRegistered(projectKey, msg.sender, uint40(block.timestamp), registrationCID);
    }

    /** View helper to fetch a project's stored metadata */
    function getProjectByKey(bytes32 projectKey)
        external
        view
        returns (string memory registrationCID, address registrar, bool verified, uint40 createdAt)
    {
        Project storage p = projects[projectKey];
        return (p.registrationCID, p.registrar, p.verified, p.createdAt);
    }

    /** Convenience: compute on-chain key (only for off-chain convenience, but costs gas) */
    function computeKey(string calldata projectID) external pure returns (bytes32) {
        return keccak256(bytes(projectID));
    }
}
