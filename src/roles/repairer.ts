import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { MovementUtils } from "utils/MovementUtils";
import { RepairUtils } from "utils/RepairUtils";
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

        if(creep.memory.repairing) {



            const room = creep.room;
            const roads = room.find(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return structure.structureType === STRUCTURE_ROAD && structure.hits < (RepairUtils.buildingRatios(structure).maxRoadStrength)
                }
            });

            const containers = room.find(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER && structure.hits < (RepairUtils.buildingRatios(structure).maxContainerStrength)
                }
            });

            const ramparts = room.find(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return structure.structureType === STRUCTURE_RAMPART && structure.hits < (RepairUtils.buildingRatios(structure).maxRampartStrength)
                }
            });

            const walls = room.find(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return structure.structureType === STRUCTURE_WALL && structure.hits < (RepairUtils.buildingRatios(structure).maxWallStrength)
                }
            });


            if(containers.length > 0 ) {
                // Find the container with the lowest health
                const weakestContainer = containers.reduce((weakest, container) => {
                    return (container.hits < weakest.hits) ? container : weakest;
                });
                if(creep.repair(weakestContainer) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(weakestContainer, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(ramparts.length > 0 && room.controller?.my) {
                // Find the rampart with the lowest health
                const weakestRampart = ramparts.reduce((weakest, rampart) => {
                    return (rampart.hits < weakest.hits) ? rampart : weakest;
                });
                if (creep.repair(weakestRampart)  == ERR_NOT_IN_RANGE) {
                    creep.moveTo(weakestRampart, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(walls.length > 0 && room.controller?.my && room.controller?.level < 5 ) {
                // Find the wall with the lowest health
                const weakestWall = walls.reduce((weakest, wall) => {
                    return (wall.hits < weakest.hits) ? wall : weakest;
                });
                if(creep.repair(weakestWall) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(weakestWall, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(roads.length > 0 ) {
                // Find the road with the lowest health
                const weakestRoad = roads.reduce((weakest, road) => {
                    return (road.hits < weakest.hits) ? road : weakest;
                });
                if (creep.repair(weakestRoad)  == ERR_NOT_IN_RANGE) {
                    creep.moveTo(weakestRoad, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }



        }
        else  {
            MovementUtils.generalGatherMovement(creep);

         }
    }
}
