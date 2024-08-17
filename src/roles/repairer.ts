import { Upgrader } from "./upgrader";
export class Repairer {
    public static run(creep: Creep) {
        creep.say('🚧');
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('🚧 repair');
        }


        var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN


                )
            }
        });

        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);


        if(creep.memory.repairing) {
            const energyAvailable = creep.room.energyAvailable;
            let maxWallStrength = 100000;
            if(energyAvailable > 1000) {
                maxWallStrength = 1000000;
            }
            if(energyAvailable > 2000) {
                maxWallStrength = 2000000;
            }
            if(energyAvailable > 3000) {
                maxWallStrength = 3000000;
            }
            if(energyAvailable > 4000) {
                maxWallStrength = 40000000;
            }
            const maxRampartStrength = maxWallStrength / 1.5
            const maxContainerStrength = 50000;
            const maxRoadStrength = 50;

            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxContainerStrength && object.structureType == STRUCTURE_CONTAINER && creep.memory.role !== 'builder'
            });
            const ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxRampartStrength && object.structureType == STRUCTURE_RAMPART
            });
            const walls = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxWallStrength && object.structureType == STRUCTURE_WALL
            });
            const roads = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxRoadStrength && object.structureType == STRUCTURE_ROAD  && creep.memory.role !== 'builder'
            });

            var extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION


                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if(creep.repair(containers[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if (creep.repair(roads[0])  == ERR_NOT_IN_RANGE) {
                creep.moveTo(roads[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(creep.repair(ramparts[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(ramparts[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(creep.repair(walls[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(walls[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }

            else if(extensions && creep.transfer(extensions, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(extensions, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                Upgrader.run(creep);
            }
        }
        else {
            var extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_EXTENSION) && structure.store[RESOURCE_ENERGY] > 0; }
            });
            let hasStorage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return structure.structureType === STRUCTURE_STORAGE }
            });
            const target_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    structure.structureType == STRUCTURE_STORAGE ||
                    (spawn &&  ((structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] > 200) || structure.structureType == STRUCTURE_CONTAINER))  ||
                (!extensions && spawn &&
                    structure.structureType == STRUCTURE_SPAWN)) && structure.store[RESOURCE_ENERGY] > 0; }
            });


            const droppedSources = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

            if (target_storage && creep.withdraw(target_storage[target_storage.length -1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(target_storage[target_storage.length -1], {visualizePathStyle: {stroke: "#ffffff"}});
            }
            else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                Upgrader.run(creep);
            }
        }
    }
}
