import { SpawnUtils } from "utils/SpawnUtils";
import { Repairer } from "./repairer";
import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { Upgrader } from "./upgrader";
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

        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

        if(!constructionSites.length) {
            Repairer.run(creep);
            return;
        }

        if(creep.memory.building) {


            const constructSpawn = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_SPAWN || site.structureType == STRUCTURE_TOWER)
                }
            });

            const storageSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_STORAGE)
                }
            });

            const links = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_LINK)
                }
            });


            const container = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_CONTAINER)
                }
            });

            const extensions = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_EXTENSION)
                }
            });


            const targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_RAMPART && site.structureType !== STRUCTURE_WALL)
                }
            });

            const roads = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_ROAD)
                }
            });

            const ramparts = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (rampart) => {
                    return (rampart.structureType == STRUCTURE_RAMPART)
                }
            });

            const walls = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (rampart) => {
                    return (rampart.structureType == STRUCTURE_WALL)
                }
            });

            const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
                filter: (flag) => {
                    return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
                }
               })

            if(constructSpawn) {
                if(creep.build(constructSpawn) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructSpawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(links.length) {
                if(creep.build(links[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(links[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(extensions[0] && creep.room.controller && creep.room.controller.level < 4){
                if(creep.build(extensions[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(ramparts.length) {
                if(creep.build(ramparts[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ramparts[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(walls.length) {
                if(creep.build(walls[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(walls[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(extensions[0]){
                if(creep.build(extensions[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(storageSite){
                if(creep.build(storageSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageSite, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(container.length){
                if(creep.build(container[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(roads.length) {
                if(creep.build(roads[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roads[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if(roomRallyPointFlag[0]) {
                creep.moveTo(roomRallyPointFlag[0]);
            }else {


                // TODO: Replace this backup target logic with a job priority structure.
                const backupTargets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(backupTargets.length > 0) {
                    if(creep.build(backupTargets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(backupTargets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } { Repairer.run(creep); }
            }
        }
        else {
           MovementUtils.generalGatherMovement(creep);

        }
    }
}
