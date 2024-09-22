import { AutoSpawn } from "autospawn";
import { SpawnUtils } from "./SpawnUtils";
import { PeaceTimeEconomy } from "./EconomiesUtils";

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

            const invadorCoreTower = flag.room?.find(FIND_HOSTILE_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_TOWER && structure.owner && structure.owner.username === 'Invader'
                }
            });

            if(invadorCoreTower && invadorCoreTower.length > 0) {
                if(flag.name === 'rallyFlag') {
                    Game.flags.rallyFlag.remove();
                    if(Game.flags.rallyFlag2) {
                        creep.room.createFlag(Game.flags.rallyFlag2.pos,'rallyFlag')
                    }
                }
                if(flag.name === 'rallyFlag2') {
                    Game.flags.rallyFlag2.remove();
                }
                if(flag.name === 'dismantleFlag') {
                    Game.flags.dismantleFlag.remove();
                }
                if(flag.name === 'attackFlag') {
                    Game.flags.attackFlag.remove();
                }

            }

            const isPatrolCreep = (
                creep.memory.role === 'healer' || creep.memory.role === 'attacker' || creep.memory.role === 'meatGrinder' || creep.memory.role === 'dismantler' || creep.memory.role === 'scout'
            );



            if(Game.flags.rallyFlag2 && Game.flags.rallyFlag && isPatrolCreep) {

                if(!!Game.flags?.stopPatrolFlag) {
                    Game.flags.rallyFlag2.remove();
                    Game.flags.stopPatrolFlag.remove();
                    return;
                }

                const creepIsNearFlag = (creep.pos.findInRange(FIND_FLAGS, 6, {
                    filter: (fff) => fff.name === 'rallyFlag'
                }).length > 0);


                if(!creep.memory.hasJoinedPatrol) {
                    flag = Game.flags.rallyFlag;
                    if(creep.moveTo(flag) === ERR_NO_PATH && friendlyRamparts) {

                        creep.moveTo(friendlyRamparts);

                    }

                    if(creepIsNearFlag) {
                        creep.memory.hasJoinedPatrol = true;
                    }

                    return;
                }

                //console.log("roomStatus",Game.flags.rallyFlag2?.room, Game.flags.rallyFlag?.room)
                if(Game.flags.rallyFlag2?.room && Game.flags.rallyFlag?.room) {
                    new RoomVisual(Game.flags.rallyFlag2.room.name).line(Game.flags.rallyFlag2.pos.x,Game.flags.rallyFlag2.pos.y,Game.flags.rallyFlag2.pos.x-3,Game.flags.rallyFlag2.pos.y,{ color: 'red' });
                    new RoomVisual(Game.flags.rallyFlag2.room.name).line(Game.flags.rallyFlag2.pos.x-3,Game.flags.rallyFlag2.pos.y,Game.flags.rallyFlag2.pos.x-2,Game.flags.rallyFlag2.pos.y+1,{ color: 'red' });
                    new RoomVisual(Game.flags.rallyFlag2.room.name).line(Game.flags.rallyFlag2.pos.x-3,Game.flags.rallyFlag2.pos.y,Game.flags.rallyFlag2.pos.x-2,Game.flags.rallyFlag2.pos.y-1,{ color: 'red' });
                    new RoomVisual(Game.flags.rallyFlag2.room.name).text(
                        '🚶 Going to ' + Game.flags.rallyFlag2.room.name,
                        Game.flags.rallyFlag2.pos.x - 3,
                        Game.flags.rallyFlag2.pos.y,
                        {align: 'right', opacity: 0.8});



                    new RoomVisual(Game.flags.rallyFlag.room.name).line(Game.flags.rallyFlag.pos.x-3,Game.flags.rallyFlag.pos.y,Game.flags.rallyFlag.pos.x,Game.flags.rallyFlag.pos.y,{ color: 'green' });
                    new RoomVisual(Game.flags.rallyFlag.room.name).line(Game.flags.rallyFlag.pos.x,Game.flags.rallyFlag.pos.y,Game.flags.rallyFlag.pos.x-1,Game.flags.rallyFlag.pos.y+1,{ color: 'green' });
                    new RoomVisual(Game.flags.rallyFlag.room.name).line(Game.flags.rallyFlag.pos.x,Game.flags.rallyFlag.pos.y,Game.flags.rallyFlag.pos.x-1,Game.flags.rallyFlag.pos.y-1,{ color: 'green' });
                    new RoomVisual(Game.flags.rallyFlag.room.name).text(
                        '🚶 Arriving from ' + Game.flags.rallyFlag.room.name,
                        Game.flags.rallyFlag.pos.x + 8,
                        Game.flags.rallyFlag.pos.y,
                        {align: 'right', opacity: 0.8});

                }



                if(flag.name === 'rallyFlag' && creepIsNearFlag && isPatrolCreep) {

                    const creepIsInSquad = creep.pos.findInRange(FIND_MY_CREEPS,6,{
                        filter: (myCreep) => (myCreep.getActiveBodyparts(ATTACK) > 0 || myCreep.getActiveBodyparts(RANGED_ATTACK) > 0) || (myCreep.memory.role === 'scout' && !Game.flags.scoutFlag)
                    }).length >= (!Game.flags.scoutFlag ? PeaceTimeEconomy.TOTAL_SCOUT_SIZE : (PeaceTimeEconomy.TOTAL_ATTACKER_SIZE * .75)) ;
                    if(creepIsInSquad) {
                        const tempRallyFlag  = flag;
                        Game.flags.rallyFlag.setPosition(Game.flags.rallyFlag2.pos);
                        Game.flags.rallyFlag2.setPosition(tempRallyFlag.pos);
                        flag = Game.flags.rallyFlag
                    }

                }

                if((!!!Game.flags?.rallyFlag2 && !!!Game.flags?.rallyFlag) && isPatrolCreep) {
                    creep.memory.hasJoinedPatrol = undefined;
                }

            }






            if(creep.moveTo(flag,{ ignoreCreeps:true}) === ERR_NO_PATH && friendlyRamparts) {

                //creep.moveTo(friendlyRamparts);

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

    public static generalGatherMovement(creep: Creep, controllerLink: StructureLink | undefined = undefined, targetSource: any = undefined) {
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

        const terminal: StructureTerminal | null =  creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TERMINAL && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) ?? null;


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

        const activeSource = creep.room.find(FIND_SOURCES_ACTIVE)

        /**
        if(creep.memory.role === 'upgrader' || creep.memory.role === 'builder') {
            if(creep.memory.role === 'upgrader' && controllerLink && creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controllerLink, {visualizePathStyle: {stroke: "#ffffff"}});
            }else if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
            }  else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if (target_storage && creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target_storage, {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return;
        }*/

        if(commandLevel < 6 && ruinsSource[0] && ruinsSource[0].store && creep.withdraw(ruinsSource[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(ruinsSource[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
        }
        else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
            creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        else if(terminal && commandLevel >= 7 && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && creep.withdraw(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal);
            return;
        }
        else if (target_storage && creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target_storage, {visualizePathStyle: {stroke: "#ffffff"}});
        }
        else if (spawn && !hasStorage && creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, {visualizePathStyle: {stroke: "#ffffff"}});
        }
        else if(targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
            if(!creep.pos.inRangeTo(targetSource.pos.x,targetSource.pos.y,1)) {
                creep.moveTo(targetSource);
            }

        }
        else if(roomRallyPointFlag[0]) {
            creep.moveTo(roomRallyPointFlag[0]);
        } else {
            creep.move(MovementUtils.randomDirectionSelector())
        }

    }

    public static claimerSettlerMovementSequence(creep:Creep):boolean {



        if(creep.memory.role !== 'settler' && creep.memory.role !== 'claimer' && creep.memory.role !== 'attackClaimer') {
            return true;
        }

        if(creep.memory.role === 'attackClaimer') {

            if(Game.flags.attackClaim) {
                MovementUtils.goToFlag(creep,Game.flags.attackClaim);
                if(Game.flags.attackClaim.room === creep.room && creep.pos.inRangeTo(Game.flags.attackClaim.pos,2)) {
                    return true;
                }
            } else {
                return true;
            }

            return false;
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


        if(creep.memory.extensionFarm === 1) {
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

        if(creep.memory.extensionFarm === 2) {
            creep.moveTo(xTarget.pos.x - 3, xTarget.pos.y + 3);
            if(terminal && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && !extensionLink.store[RESOURCE_ENERGY] && creep.room.energyAvailable !== creep.room.energyCapacityAvailable && creep.withdraw(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
                return;
            }
             else if(extensionLink && creep.withdraw(extensionLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){

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
