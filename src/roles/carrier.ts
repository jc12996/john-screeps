import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";

export class Carrier {

    public static run(creep: Creep): void {
        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🚚");
        }
        const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100) && structure.room?.controller?.my; }
        });

        var spawnAndExtension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TOWER && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        var nearestStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                )
            }
        });

        var smallStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.store[RESOURCE_ENERGY] < 10000 && structure.room?.controller?.my;
            }
        });

        var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my


                )
            }
        });


        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);


        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })


        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > 0 && creep.store[RESOURCE_ENERGY] <= 250))) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }


        if(!creep.memory.carrying) {
            const droppedSources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 30, {
                filter:  (source) => {
                    return (
                        source.amount > 10 && source.room?.controller?.my


                    )
                }
            });

            var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                filter:  (creep) => {
                    return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
                }
            });

            if(containers && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            } else if(!hostileCreeps && droppedSources.length && creep.pickup(droppedSources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources[0]);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }


        } else if(creep.memory.carrying) {


            if(towers && carriers[2] && creep.id === carriers[2].id ) {
                creep.memory.carryIndex = 2
            } else if((
                (carriers[0] && creep.id === carriers[0].id) ||
                (carriers[1] && creep.id === carriers[1].id) ||
                (carriers[6] && creep.id === carriers[6].id)
            )) {
                creep.memory.carryIndex = 0
            } else if(
                nearestStorage
            ) {
                creep.memory.carryIndex = 1
            } else {
                creep.memory.carryIndex = 0
            }





            if(creep.memory.carryIndex == 1) {
                if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                } else if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(spawnAndExtension && creep.transfer(spawnAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spawnAndExtension);
                }
                return;

            }


            if(creep.memory.carryIndex == 2) {
                if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                } else if(spawnAndExtension && creep.transfer(spawnAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spawnAndExtension);
                }
                return;

            }

            if(creep.memory.carryIndex == 0) {
                if(spawnAndExtension && creep.transfer(spawnAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spawnAndExtension);
                } else if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                }
                return;
            }

            if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 S');
                creep.moveTo(storage);
            } else if(spawnAndExtension && creep.transfer(spawnAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 E');
                creep.moveTo(spawnAndExtension);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            } else {
                Upgrader.run(creep)
            }
        }
    }
}

