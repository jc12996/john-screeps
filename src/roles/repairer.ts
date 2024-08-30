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
            let maxWallStrength = 10000;
            let maxContainerStrength = 50000;
            let maxRoadStrength = 50;

            if(creep.room.controller && creep.room.controller.my && creep.room.controller.level > 0) {
                switch(creep.room.controller.level) {
                    case 5:
                        maxWallStrength = 100000;
                        break;
                    case 6:
                        maxWallStrength = 200000;
                        break;
                    case 7:
                    case 8:
                    maxWallStrength = 1000000;
                    break;
                }

            }

            const maxRampartStrength = maxWallStrength * 0.90;



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
