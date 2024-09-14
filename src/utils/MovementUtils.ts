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

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }

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

    public static generalGatherMovement(creep: Creep, controllerLink: StructureLink | undefined = undefined) {
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50) && structure.room?.controller?.my; }
        });

        let totalSpawnStore = 200;
        if(creep.room.controller && creep.room.controller.my && creep.room.controller?.level >= 5) {
            totalSpawnStore = 301;
        }
        const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] >= totalSpawnStore) && creep.memory.role !== 'settler'; }
        });

        const target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0); }
        });

        const hasStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_STORAGE); }
        });

        const ruinsSource = creep.room.find(FIND_RUINS, {
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

           const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter:  (source) => {
                return (
                    source.amount >= 50 && source.room?.controller?.my


                )
            }
        });
        const commandLevel =  creep.room?.controller?.level ?? 1;

        if(creep.memory.role === 'upgrader' || creep.memory.role === 'builder') {
            if(creep.memory.role === 'upgrader' && controllerLink && creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controllerLink, {visualizePathStyle: {stroke: "#ffffff"}});
            }else if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
            }  else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return;
        }

        if(commandLevel < 6 && ruinsSource[0] && ruinsSource[0].store && creep.withdraw(ruinsSource[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(ruinsSource[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if (target_storage && creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target_storage, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if (spawn && !hasStorage && creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, {visualizePathStyle: {stroke: "#ffffff"}});
        } else if(roomRallyPointFlag[0]) {
            creep.moveTo(roomRallyPointFlag[0]);
        } else {
            creep.move(MovementUtils.randomDirectionSelector())
        }

    }

    public static claimerSettlerMovementSequence(creep:Creep):boolean {



        // if(!!Game.flags.wayPointFlag && !!!creep.memory.hitWaypointFlag && creep.pos && creep.pos.inRangeTo(Game.flags.wayPointFlag.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
        //     creep.memory.hitWaypointFlag = true;
        // }else if(!!Game.flags.wayPointFlag && !!!creep.memory.hitWaypointFlag && Game.flags.wayPointFlag.pos !== creep.pos) {

        //     MovementUtils.goToFlag(creep,Game.flags.wayPointFlag);

        //     return false;
        // }

        // creep.memory.hitWaypointFlag2 = undefined;
        // if(!!creep.memory.hitWaypointFlag2 && !!!creep.memory.hitWaypointFlag2 && creep.pos && creep.pos.inRangeTo(Game.flags.wayPointFlag2.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
        //     creep.memory.hitWaypointFlag2 = true;
        // }else if(!!Game.flags.wayPointFlag2 && !!!creep.memory.hitWaypointFlag2 && Game.flags.wayPointFlag2.pos !== creep.pos) {

        //     MovementUtils.goToFlag(creep,Game.flags.wayPointFlag2);

        //     return false;
        // }

        if(creep.memory.role !== 'settler' && creep.memory.role !== 'claimer') {
            return true;
        }

        if(!!!AutoSpawn.nextClaimFlag) {
            return true;
        }

        if(AutoSpawn.nextClaimFlag.room == creep.room) {
            return true;
        }
        console.log(AutoSpawn.nextClaimFlag.room)
        MovementUtils.goToFlag(creep,AutoSpawn.nextClaimFlag);
        if(!!AutoSpawn.nextClaimFlag && AutoSpawn.nextClaimFlag.room !== creep.room){
            return false;
        }

        return true;
    }

    public static xHarvesterMovementSequence(creep:Creep,xTarget:any,extensionLink: any,storage: any,spawns: any,towers: any,extension: any,terminal:StructureTerminal | null) {


        if(creep.memory.extensionFarm1) {
            creep.moveTo(xTarget.pos.x - 3, xTarget.pos.y + 3);

            if(extensionLink && extensionLink.store[RESOURCE_ENERGY] > 0 && creep.withdraw(extensionLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(extensionLink);
                return;
            } else if(storage && storage.store[RESOURCE_ENERGY] > 0 && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && creep.withdraw(storage , RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
                return;
            }
            return;
        }

        if(creep.memory.extensionFarm2) {
            creep.moveTo(xTarget.pos.x - 3, xTarget.pos.y + 3);
            if(terminal && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && !extensionLink.store[RESOURCE_ENERGY] && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && creep.withdraw(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
                return;
            } else if(extensionLink && creep.withdraw(extensionLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(extensionLink);
                return;
            }
            return;
        }

    }

    public static strongUpgraderSequence(creep:Creep,controllerLink:any) {
        creep.moveTo(controllerLink.pos.x, controllerLink.pos.y);
        if(controllerLink && controllerLink.store[RESOURCE_ENERGY] > 0 && creep.withdraw(controllerLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(controllerLink);
            return;
        }
    }
}
