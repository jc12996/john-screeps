import { SpawnUtils } from "utils/SpawnUtils";
import { Repairer } from "./repairer";
export class Builder {
    public static run(creep: Creep) {
        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🔨');
        }
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && (creep.store.getFreeCapacity() == 0) ) {
            creep.memory.building = true;
            creep.say('🔨 build');
        }

        var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN


                )
            }
        });

        if(creep.memory.building) {

            var constructSpawn = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_SPAWN || site.structureType == STRUCTURE_TOWER)
                }
            });

            var storageSite = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_STORAGE)
                }
            });

            var container = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_CONTAINER)
                }
            });

            const extensions = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_EXTENSION)
                }
            });


            var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_RAMPART && site.structureType !== STRUCTURE_WALL)
                }
            });

            var roads = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_ROAD)
                }
            });

            var ramparts = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (rampart) => {
                    return (rampart.structureType == STRUCTURE_RAMPART)
                }
            });

            var walls = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (rampart) => {
                    return (rampart.structureType == STRUCTURE_WALL)
                }
            });

            if(constructSpawn.length) {
                if(creep.build(constructSpawn[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructSpawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(extensions.length){
                if(creep.build(extensions[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if(storageSite.length){
                if(creep.build(storageSite[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageSite[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if(container.length){
                if(creep.build(container[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }  else if(ramparts.length) {
                if(creep.build(ramparts[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ramparts[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }  else if(walls.length) {
                if(creep.build(walls[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(walls[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if(roads.length) {
                if(creep.build(roads[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roads[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // TODO: Replace this backup target logic with a job priority structure.
                var backupTargets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(backupTargets.length > 0) {
                    if(creep.build(backupTargets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(backupTargets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } { Repairer.run(creep); }
            }
        }
        else {
            let sources = creep.room.find(FIND_SOURCES_ACTIVE);
            const extensions  = creep.room.find(FIND_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });
            const target_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    structure.structureType == STRUCTURE_STORAGE ||
                    (spawn &&  ((structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] > 200)))  ||
                (!extensions && spawn &&
                    structure.structureType == STRUCTURE_SPAWN)) && structure.store[RESOURCE_ENERGY] > 0; }
            });

            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);


                if (target_storage && creep.withdraw(target_storage[target_storage.length -1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_storage[target_storage.length -1], {visualizePathStyle: {stroke: "#ffffff"}});
            }
            else if(!target_storage && sources[sources.length-1] && creep.harvest(sources[sources.length-1]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sources.length-1], {visualizePathStyle: {stroke: "#ffffff"}});
            }
            else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(creep.memory.role === 'settler' && creep.harvest(sources[sources.length-1]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sources.length-1], {visualizePathStyle: {stroke: "#ffffff"}});
            }
            else {
                Repairer.run(creep);
            }

        }
    }
}
