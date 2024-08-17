import { SpawnUtils } from "utils/SpawnUtils";

export class Carrier {

    public static run(creep: Creep): void {
        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🚚🔄");
        }
        const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100); }
        });

        var spanAndExtension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TOWER


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        var nearestStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE


                )
            }
        });

        var smallStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.store[RESOURCE_ENERGY] < 10000;
            }
        });

        var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN


                )
            }
        });


        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);


        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE)
            }
           })


        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > 0 && creep.store[RESOURCE_ENERGY] <= 250))) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }


        if(!creep.memory.carrying) {
            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount > 10


                    )
                }
            });


            // if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffffff'}});
            // }
            if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources);
            } else if(containers && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }


        } else if(creep.memory.carrying) {

            if(towers && carriers[2] && creep.id === carriers[2].id ) {
                creep.memory.carryIndex = 2
            } else if((
                (carriers[0] && creep.id === carriers[0].id) ||
                (carriers[1] && creep.id === carriers[1].id)
            )) {
                creep.memory.carryIndex = 0
            } else if(
                nearestStorage
            ) {
                creep.memory.carryIndex = 1
            } else {
                creep.memory.carryIndex = 0
            }



            if(creep.memory.carryIndex == 1 && (storage || towers)) {
                if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                } else if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(spanAndExtension && creep.transfer(spanAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spanAndExtension);
                }

            }
            else if(creep.memory.carryIndex == 2 && (towers)) {
                if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                } else if(spanAndExtension && creep.transfer(spanAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spanAndExtension);
                }

            }
            else if(creep.memory.carryIndex == 0 && (spanAndExtension || storage)) {
                if(spanAndExtension && creep.transfer(spanAndExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 E');
                    creep.moveTo(spanAndExtension);
                } else if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 T');
                    creep.moveTo(towers);
                } else if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(storage);
                }
            } else if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 S');
                creep.moveTo(storage);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
        }
    }
}

