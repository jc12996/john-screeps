import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { MovementUtils } from "utils/MovementUtils";
export class Repairer {
    public static run(creep: Creep) {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚧');
        }

        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('🚧 repair');
        }

        var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN  && creep.room.controller?.my


                )
            }
        });


        if(creep.memory.repairing) {
            const energyAvailable = creep.room.energyAvailable;
            let maxWallStrength = 1000;
            let maxContainerStrength = 50000;
            let maxRoadStrength = 50;
            let maxRampartStrength = 1000;
            if(energyAvailable > 1000) {
                maxWallStrength = 5000;
                maxRampartStrength = maxWallStrength / 1.5
            }
            if(energyAvailable > 2000) {
                maxWallStrength = 10000;
                maxRampartStrength = maxWallStrength / 1.5
            }
            if(energyAvailable > 3000) {
                maxWallStrength = 1000000;
                maxRampartStrength = maxWallStrength / 1.5
            }
            if(energyAvailable > 4000) {
                maxWallStrength = 3000000;
                maxRampartStrength = maxWallStrength / 1.5
            }



            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxContainerStrength && creep.room.controller?.my && object.structureType == STRUCTURE_CONTAINER && creep.memory.role !== 'builder'
            });
            const ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxRampartStrength && creep.room.controller?.my && object.structureType == STRUCTURE_RAMPART
            });
            const walls = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxWallStrength && creep.room.controller?.my && object.structureType == STRUCTURE_WALL
            });
            const roads = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxRoadStrength && creep.room.controller?.my && object.structureType == STRUCTURE_ROAD  && creep.memory.role !== 'builder'
            });

            var extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION


                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.room.controller?.my;
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
            else {
                Upgrader.run(creep);
            }

        }
        else  {
            MovementUtils.generalGatherMovement(creep);

         }
    }
}
