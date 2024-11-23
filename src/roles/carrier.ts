import { SpawnUtils } from "utils/SpawnUtils";
import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { Labs } from "labs";

export class Carrier {
    public static run(creep: Creep): void {
        if (!creep.memory.isBoosted) {
            const canContinue = Labs.boostCreep(creep);
            if (!canContinue) {
                return;
            }
        }

        const commandLevel = creep.room?.controller?.level ?? 1;

        // Cache structures to avoid repeated searches
        const storage = this.findClosestStructure(creep, STRUCTURE_STORAGE);
        const terminal = this.findClosestStructure(creep, STRUCTURE_TERMINAL);
        const nearestStorageOrTerminal = this.findClosestStructure(creep, [STRUCTURE_TERMINAL, STRUCTURE_STORAGE]);

        // Determine extension farm assignment
        this.assignExtensionFarm(creep, storage as StructureStorage | null, terminal as StructureTerminal | null);

        if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            this.displayCreepIcon(creep);
        }
        const extension = this.findClosestStructure(creep, STRUCTURE_EXTENSION) as StructureExtension | null;
        const extensionsNeedingEnergy = extension?.store && extension?.store?.getFreeCapacity(RESOURCE_ENERGY) > 0;

        const playerHostiles = this.findHostileCreeps(creep);
        if (commandLevel <= 6 && playerHostiles.length > 0 && creep.room.controller?.my) {
            creep.room.controller.activateSafeMode();
        }

        const nearestSpawn = this.findClosestStructure(creep, STRUCTURE_SPAWN);

        const nearestTower = this.findClosestStructure(creep, STRUCTURE_TOWER) as StructureTower | null;

        const nearestAvailableWorkingRoleCreep = this.findAvailableWorkingRoleCreep(creep, commandLevel);

        const roomRallyPointFlag = this.findFlag(creep, COLOR_BLUE);

        this.manageCarryingState(creep, commandLevel);
        if (!creep.memory.carrying) {
            this.handleGathering(creep, storage as StructureStorage | null, terminal as StructureTerminal | null, nearestStorageOrTerminal);
        } else {
            this.handleCarrying(creep, terminal as StructureTerminal | null, roomRallyPointFlag, nearestStorageOrTerminal, extension, nearestTower, storage as StructureStorage | null, nearestAvailableWorkingRoleCreep, nearestSpawn);
        }
    }

    private static findClosestStructure(creep: Creep, structureType: StructureConstant | StructureConstant[], options: FindPathOpts = {}): Structure | null {
        return creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                const types = Array.isArray(structureType) ? structureType : [structureType];
                return types.includes(structure.structureType) && structure.room?.controller?.my;
            },
            ...options
        });
    }

    private static findHostileCreeps(creep: Creep): Creep[] {
        return creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: (hostileCreep) => !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner) && hostileCreep.getActiveBodyparts(ATTACK) > 0
        });
    }

    private static findAvailableWorkingRoleCreep(creep: Creep, commandLevel: number): Creep | null {
        return creep.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (workCreep) => {
                return (
                    ((workCreep.memory.role === 'upgrader' || (workCreep.memory.role === 'builder' && commandLevel >= 4)) && workCreep.memory.upgrading !== true) &&
                    workCreep.store.getFreeCapacity() > 0 && workCreep.room.energyAvailable < ((commandLevel >= 7) ? (creep.memory.role === 'miner' ? workCreep.room.energyCapacityAvailable : 1000) : 800)
                );
            }
        });
    }

    private static findFlag(creep: Creep, color: ColorConstant): Flag | null {
        return creep.room.find(FIND_FLAGS, {
            filter: (flag) => flag.color === color && flag.room?.controller?.my
        })[0] ?? null;
    }

    private static assignExtensionFarm(creep: Creep, storage: StructureStorage | null, terminal: StructureTerminal | null): void {
        const carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == creep.room.name);
        const commandLevel = creep.room?.controller?.level ?? 1;

        if (((terminal && terminal.store[RESOURCE_ENERGY] > 2000) || (creep.room.energyCapacityAvailable > 1000 && creep.room.energyAvailable > 300))
            && carriers.length > 0 && carriers[1] && creep.name === carriers[1].name && carriers.length > 3) {
            creep.memory.extensionFarm = 2;
        } else if (((storage && storage.store[RESOURCE_ENERGY] > 2000) || creep.room.energyCapacityAvailable > 1000)
            && carriers[0] && creep.name === carriers[0].name && creep.room.energyAvailable > 0 && carriers.length > 2) {
            creep.memory.extensionFarm = 1;
        } else if ((storage && storage.store[RESOURCE_ENERGY] > 2000 || creep.room.energyCapacityAvailable > 1000) && carriers.length > 2 && carriers[2] && creep.name === carriers[2].name
            && commandLevel >= 6 && creep.room.energyAvailable > 0) {
            creep.memory.extensionFarm = 3;
        } else {
            creep.memory.extensionFarm = undefined;
        }
    }

    private static displayCreepIcon(creep: Creep): void {
        if (creep.memory?.extensionFarm === 1) {
            creep.say("🚚 X");
        } else if (creep.memory?.extensionFarm === 2) {
            creep.say("🚚 X2");
        } else if (creep.memory?.extensionFarm === 3) {
            creep.say("🔬");
        } else {
            creep.say("🚚");
        }
    }

    private static manageCarryingState(creep: Creep, commandLevel: number): void {
        const capacitySpawnLimit = (creep.room.controller && creep.room.controller?.level > 6) ? 100 : 50;
        if (!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > capacitySpawnLimit))) {
            creep.memory.carrying = true;
        }

        if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }
    }

    private static handleGathering(creep: Creep, storage: StructureStorage | null, terminal: StructureTerminal | null, nearestStorageOrTerminal: Structure | null): void {
        if (creep.memory.extensionFarm === 2 || creep.memory.extensionFarm === 1) {
            const extensionLink = getLinkByTag(creep, 'ExtensionLink');
            if (creep.memory.role === 'carrier' && (nearestStorageOrTerminal || extensionLink) && creep.room?.controller?.level! >= 5) {
                MovementUtils.xHarvesterMovementSequence(creep, nearestStorageOrTerminal, extensionLink, storage, terminal);
                //creep:Creep,xTarget:any,extensionLink: any,storage: any,terminal:StructureTerminal | null
                return;
            }
        }

        MovementUtils.generalGatherMovement(creep);
    }

    private static handleCarrying(creep: Creep, terminal: StructureTerminal | null, roomRallyPointFlag: Flag | null, nearestStorageOrTerminal: Structure | null, extension: Structure | null, nearestTower: Structure | null, storage: StructureStorage | null, nearestAvailableWorkingRoleCreep: Creep | null, nearestSpawn: Structure | null): void {
        if (creep.memory.extensionFarm === 1) {
            if (extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(extension);
            } else if (nearestTower && creep.transfer(nearestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestTower);
            } else if (storage && creep.store.energy > 0 && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
            } else if(nearestSpawn){
                creep.moveTo(nearestSpawn);
            }
            return;
        }

        if (creep.memory.extensionFarm === 2) {
            if (nearestTower && creep.transfer(nearestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestTower);
            } else if (extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(extension);
            } else if (terminal && creep.store.energy > 0 && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
            } else if (nearestSpawn) {
                creep.moveTo(nearestSpawn);
            }
            return;
        }

        if (creep.memory.extensionFarm === 3) {
            if (creep.store[RESOURCE_ENERGY] > 0 && storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
            } else if (creep.store[RESOURCE_ENERGY] > 0 && terminal && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
            } else if (nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            } else if (roomRallyPointFlag) {
                creep.moveTo(roomRallyPointFlag);
            }
            return;
        }

        if (extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(extension);
        } else if (nearestSpawn && creep.transfer(nearestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(nearestSpawn);
        } else if (storage && creep.store[RESOURCE_ENERGY] > 0 && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        } else if (terminal && creep.store[RESOURCE_ENERGY] > 0 && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal);
        } else if (nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(nearestAvailableWorkingRoleCreep);
        } else if (roomRallyPointFlag) {
            creep.moveTo(roomRallyPointFlag);
        }
    }
}

