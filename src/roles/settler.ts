import { Builder } from "./builder";
import { AutoSpawn } from "autospawn";
import { Repairer } from "./repairer";
import { Harvester } from "./harvester";
import { SpawnUtils } from "utils/SpawnUtils";
import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { Upgrader } from "./upgrader";

export class Settler {



    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🌎");
        }


        if(AutoSpawn.nextClaimFlag && Game.flags.settlerFlag && AutoSpawn.nextClaimFlag.room !== creep.room) {
            MovementUtils.goToFlag(creep,AutoSpawn.nextClaimFlag)
            return;
        } else if (Game.flags.settlerFlag && Game.flags.settlerFlag.room !== creep.room) {
            MovementUtils.goToFlag(creep,Game.flags.settlerFlag)
            return;
        }


        if(AutoSpawn.nextClaimFlag && Game.flags?.settlerFlag && AutoSpawn.nextClaimFlag?.room !== creep.room) {
            var friendlyRamparts = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_RAMPART && site.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(site.owner))
                }
            });

            if(friendlyRamparts && friendlyRamparts.pos !== creep.pos && !creep.memory?.friendRampartEntered) {
                creep.memory.friendRampartEntered = true
                creep.moveTo(friendlyRamparts);
                return;
            } else {

                creep.moveTo(AutoSpawn.nextClaimFlag);
            }
            return;
        }




        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        var spawns = creep.room.find(FIND_MY_SPAWNS);

        var spawnConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (rampart) => {
                return (rampart.structureType == STRUCTURE_SPAWN)
            }
        });



        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });

        if(creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.delivering && creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🌎 settle');
        }

        if(!spawns && !spawnConstructionSites && creep.room?.controller?.my && AutoSpawn.nextClaimFlag) {



                if(creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x + 1,AutoSpawn.nextClaimFlag.pos.y+1,STRUCTURE_ROAD) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x -1,AutoSpawn.nextClaimFlag.pos.y-1,STRUCTURE_ROAD) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x -1 ,AutoSpawn.nextClaimFlag.pos.y + 1,STRUCTURE_ROAD) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x +1 ,AutoSpawn.nextClaimFlag.pos.y - 1,STRUCTURE_ROAD) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos,STRUCTURE_SPAWN, 'Spawn'+(AutoSpawn.totalSpawns + 1)) == ERR_NOT_IN_RANGE) {
                    console.log('Creating '+ 'Spawn'+(AutoSpawn.totalSpawns + 1))
                    creep.moveTo(AutoSpawn.nextClaimFlag, {visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                }

        }


        if(creep.room.controller && creep.room.controller.my && spawns.length) {
            let extensions = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTENSION });
            let extensionCount;

            switch (creep.room.controller.level) {
                case 2:
                    extensionCount = 5;
                    break;
                case 3:
                    extensionCount = 10;
                    break;
                default:
                    extensionCount = (creep.room.controller.level - 2) * 10;
                break;
            }
            if(extensionCount < extensions.length && extensionCount <= 10 ) {
                if (extensionCount == 5 ) {
                    if(
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x + 1,AutoSpawn.nextClaimFlag.pos.y,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x + 2,AutoSpawn.nextClaimFlag.pos.y,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x -1,AutoSpawn.nextClaimFlag.pos.y,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x ,AutoSpawn.nextClaimFlag.pos.y + 1,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x ,AutoSpawn.nextClaimFlag.pos.y - 1,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos,STRUCTURE_SPAWN, 'Spawn'+(AutoSpawn.totalSpawns + 1)) == ERR_NOT_IN_RANGE) {
                        console.log('Creating '+ 'Spawn'+(AutoSpawn.totalSpawns + 1))
                        creep.moveTo(AutoSpawn.nextClaimFlag, {visualizePathStyle: {stroke: '#ffffff'}});
                        return;
                    }
                } else if (extensionCount == 10 ) {
                    if(
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x + 2,AutoSpawn.nextClaimFlag.pos.y,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x -2,AutoSpawn.nextClaimFlag.pos.y,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x ,AutoSpawn.nextClaimFlag.pos.y + 2,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x ,AutoSpawn.nextClaimFlag.pos.y + 2,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos.x ,AutoSpawn.nextClaimFlag.pos.y - 2,STRUCTURE_CONTAINER) == ERR_NOT_IN_RANGE ||
                    creep.room?.createConstructionSite(AutoSpawn.nextClaimFlag.pos,STRUCTURE_SPAWN, 'Spawn'+(AutoSpawn.totalSpawns + 1)) == ERR_NOT_IN_RANGE) {
                        console.log('Creating '+ 'Spawn'+(AutoSpawn.totalSpawns + 1))
                        creep.moveTo(AutoSpawn.nextClaimFlag, {visualizePathStyle: {stroke: '#ffffff'}});
                        return;
                    }
                }
            }

        }

        const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter:  (source) => {
                return (
                    source.amount > 10 && source.room?.controller?.my


                )
            }
        });

        const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100) && creep.room?.controller?.my; }
        });


        if(!creep.memory.delivering) {
            let targetSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                filter:  (source) => {
                    return (
                        source.room?.controller?.my


                    )
                }
            });
            if(targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(containers  && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(droppedSources  && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else {
                Carrier.run(creep);
            }
        }else {

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
            const maxContainerStrength = 50000;
            const maxRoadStrength = 50;

            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxContainerStrength && object.structureType == STRUCTURE_CONTAINER && creep.memory.role !== 'builder'
            });

            const roads = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits <= maxRoadStrength && object.structureType == STRUCTURE_ROAD  && creep.memory.role !== 'builder'
            });



            if(containers.length) {
                if(creep.repair(containers[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (roads.length && creep.repair(roads[0])  == ERR_NOT_IN_RANGE) {
                creep.moveTo(roads[0], {visualizePathStyle: {stroke: '#ffffff'}});
            } else if(creep.room?.controller && creep.room?.controller.my && creep.room?.controller.level < 2) {
                Upgrader.run(creep)
            }  else if(targets.length) {
                Builder.run(creep);
            } else if(droppedSources && spawns[0].store.getFreeCapacity() == 0) {
                Carrier.run(creep);
            } else {
                Upgrader.run(creep)
            }

        }



    }

}

