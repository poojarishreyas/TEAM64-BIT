import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ProjectRegistryOptimized", function () {
    async function deployProjectRegistryFixture() {
        const [admin, registrar, otherAccount] = await ethers.getSigners();

        const ProjectRegistry = await ethers.getContractFactory("ProjectRegistryOptimized");
        const projectRegistry = await ProjectRegistry.deploy(admin.address);

        // Grant REGISTRAR_ROLE to registrar
        const REGISTRAR_ROLE = await projectRegistry.REGISTRAR_ROLE();
        await projectRegistry.grantRole(REGISTRAR_ROLE, registrar.address);

        return { projectRegistry, admin, registrar, otherAccount, REGISTRAR_ROLE };
    }

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            const { projectRegistry, admin } = await loadFixture(deployProjectRegistryFixture);
            const DEFAULT_ADMIN_ROLE = await projectRegistry.DEFAULT_ADMIN_ROLE();
            expect(await projectRegistry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
        });

        it("Should set the right registrar role admin", async function () {
            const { projectRegistry, admin, REGISTRAR_ROLE } = await loadFixture(deployProjectRegistryFixture);
            expect(await projectRegistry.hasRole(REGISTRAR_ROLE, admin.address)).to.be.true;
        });
    });

    describe("Registration", function () {
        it("Should allow registrar to register a project by ID", async function () {
            const { projectRegistry, registrar } = await loadFixture(deployProjectRegistryFixture);
            const projectID = "project-1";
            const registrationCID = "QmHash";

            await expect(projectRegistry.connect(registrar).registerProjectByID(projectID, registrationCID))
                .to.emit(projectRegistry, "ProjectRegistered");

            const key = await projectRegistry.computeKey(projectID);
            const project = await projectRegistry.getProjectByKey(key);
            expect(project.registrationCID).to.equal(registrationCID);
            expect(project.registrar).to.equal(registrar.address);
            expect(project.verified).to.be.true;
        });

        it("Should allow registrar to register a project by Key", async function () {
            const { projectRegistry, registrar } = await loadFixture(deployProjectRegistryFixture);
            const projectID = "project-2";
            const registrationCID = "QmHash2";
            const key = ethers.keccak256(ethers.toUtf8Bytes(projectID));

            await expect(projectRegistry.connect(registrar).registerProjectByKey(key, registrationCID))
                .to.emit(projectRegistry, "ProjectRegistered");

            const project = await projectRegistry.getProjectByKey(key);
            expect(project.registrationCID).to.equal(registrationCID);
        });

        it("Should fail if non-registrar tries to register", async function () {
            const { projectRegistry, otherAccount } = await loadFixture(deployProjectRegistryFixture);
            const projectID = "project-3";
            const registrationCID = "QmHash3";

            await expect(projectRegistry.connect(otherAccount).registerProjectByID(projectID, registrationCID))
                .to.be.reverted; // AccessControl revert message varies
        });

        it("Should fail if project already exists", async function () {
            const { projectRegistry, registrar } = await loadFixture(deployProjectRegistryFixture);
            const projectID = "project-1";
            const registrationCID = "QmHash";

            await projectRegistry.connect(registrar).registerProjectByID(projectID, registrationCID);

            await expect(projectRegistry.connect(registrar).registerProjectByID(projectID, "QmHashNew"))
                .to.be.revertedWith("already exists");
        });
    });
});
