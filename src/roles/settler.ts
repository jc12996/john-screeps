import { Builder } from "./builder";
import { AutoSpawn } from "autospawn";
import { Repairer } from "./repairer";
import { Harvester } from "./harvester";
import { SpawnUtils } from "utils/SpawnUtils";
import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { Upgrader } from "./upgrader";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";

export class Settler {



    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🌎");
        }

        if(!creep.memory.hitWaypointFlag && creep.pos.inRangeTo(Game.flags.wayPointFlag.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
            creep.memory.hitWaypointFlag = true;
        }else if(!creep.memory.hitWaypointFlag && Game.flags.wayPointFlag.pos !== creep.pos) {

            MovementUtils.goToFlag(creep,Game.flags.wayPointFlag);

            return;
        }


        if(!creep.memory.hitWaypointFlag2 && creep.pos.inRangeTo(Game.flags.wayPointFlag2.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
            creep.memory.hitWaypointFlag2 = true;
        }else if(!creep.memory.hitWaypointFlag2 && Game.flags.wayPointFlag2.pos !== creep.pos) {

            MovementUtils.goToFlag(creep,Game.flags.wayPointFlag2);

            return;
        }



        if(AutoSpawn.nextClaimFlag && AutoSpawn.nextClaimFlag.room !== creep.room) {
            MovementUtils.goToFlag(creep,AutoSpawn.nextClaimFlag)
            return;
        }


        if(AutoSpawn.nextClaimFlag  && AutoSpawn.nextClaimFlag?.room !== creep.room) {
            var friendlyRamparts = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_RAMPART && site.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(site.owner))
                }
            });

            if(creep.moveTo(AutoSpawn.nextClaimFlag) === ERR_NO_PATH && friendlyRamparts && friendlyRamparts.pos !== creep.pos && !creep.memory?.friendRampartEntered) {
                creep.memory.friendRampartEntered = true
                creep.moveTo(friendlyRamparts);
                return;
            }
            return;
        }




        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        var spawns = creep.room.find(FIND_MY_SPAWNS);

        ScaffoldingUtils.createSpawn(creep,AutoSpawn.nextClaimFlag,AutoSpawn.totalSpawns);

        if(creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.delivering && creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🌎 settle');
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

            let ruinsSource = creep.pos.findClosestByPath(FIND_RUINS, {
                filter:  (source) => {
                    return (
                        source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0


                    )
                }
            });

            if(ruinsSource && ruinsSource.store && creep.withdraw(ruinsSource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(ruinsSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(droppedSources  && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                Harvester.run(creep);
            }
        }else {

            var constructSpawn = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_SPAWN)
                }
            });

            if(creep.room?.controller && creep.room?.controller.my && creep.room?.controller.level < 2) {
                Upgrader.run(creep)
            } else if(constructSpawn.length) {
                if(creep.build(constructSpawn[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructSpawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    Builder.run(creep);
                }
            } else {
                Upgrader.run(creep)
            }

        }



    }

}

