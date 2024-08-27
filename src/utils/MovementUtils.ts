import { AutoSpawn } from "autospawn";
import { SpawnUtils } from "./SpawnUtils";

export class MovementUtils {

    private static DIRECTIONS_ARRAY = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    public static randomDirectionSelector(): DirectionConstant {
        return MovementUtils.DIRECTIONS_ARRAY[Math.floor(Math.random() * MovementUtils.DIRECTIONS_ARRAY.length)];
    }

    public static nearestExit(creep: Creep): RoomPosition {
        const exits = creep.room.find(FIND_EXIT)
        return exits[0];

    }

    public static goToAttackFlag(creep: Creep): void {

        this.goToFlag(creep,Game.flags.attackFlag)


    }

    public static goToFlag(creep: Creep, flag:Flag | Creep): void {

            var friendlyRamparts = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_RAMPART && !site.isPublic && site.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(site.owner))
                }
            });

            if(creep.moveTo(flag) === ERR_NO_PATH && friendlyRamparts) {

                creep.moveTo(friendlyRamparts);

            }


    }

    public static goToRally(creep: Creep): void {

        this.goToFlag(creep,Game.flags.rallyFlag)

    }

    public static defaultArmyMovement(creep: Creep, flag: Flag | Creep | undefined):void {

        if(flag) {
            MovementUtils.goToFlag(creep,flag)
        }else if(Game?.flags?.attackFlag) {
            MovementUtils.goToAttackFlag(creep);
        } else if(Game?.flags?.rallyFlag) {
            MovementUtils.goToRally(creep);
        } else {
            creep.move(MovementUtils.randomDirectionSelector())
        }
    }

    public static generalGatherMovement(creep: Creep) {
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50) && structure.room?.controller?.my; }
        });

        let totalSpawnStore = 100;
        if(creep.room.controller && creep.room.controller.my && creep.room.controller?.level >= 5) {
            totalSpawnStore = 301;
        }
        const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] >= totalSpawnStore); }
        });

        const target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0); }
        });

        const hasStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_STORAGE); }
        });

        let ruinsSource = creep.pos.findClosestByPath(FIND_RUINS, {
            filter:  (source) => {
                return (
                    source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0


                )
            }
        });

        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })

        if(ruinsSource && ruinsSource.store && creep.withdraw(ruinsSource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(ruinsSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if (target_storage && creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target_storage, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if (spawn && !hasStorage && creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if(roomRallyPointFlag[0]) {
            creep.moveTo(roomRallyPointFlag[0]);
        } else {
            creep.move(MovementUtils.randomDirectionSelector())
        }

    }
}
