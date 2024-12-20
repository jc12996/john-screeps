import { Builder } from "./builder";
import { AutoSpawn } from "autospawn";
import { Repairer } from "./repairer";
import { Harvester } from "./harvester";
import { SpawnUtils } from "utils/SpawnUtils";
import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { Upgrader } from "./upgrader";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { Miner } from "./miner";

export class Settler {



    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🌎");
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }


        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        var spawns = creep.room.find(FIND_MY_SPAWNS);

        if(spawns.length) {
            let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawns[0].room.name);

            const extensions = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_EXTENSION)
                }
            });


            if(extensions.length > 0) {
                Builder.run(creep);
            } else if(harvesters.length > 0) {
                Carrier.run(creep);
            } else {
                Upgrader.run(creep);
            }

            return;
        }

        if(creep.room.controller?.my) {
            ScaffoldingUtils.createSpawn(creep,AutoSpawn.nextClaimFlag,AutoSpawn.totalSpawns);

        }

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

            if(!targetSource) {
                Miner.run(creep)
                return;
            }

            let ruinsSource = creep.pos.findClosestByPath(FIND_RUINS, {
                filter:  (source) => {
                    return (
                        source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0


                    )
                }
            });

            MovementUtils.generalGatherMovement(creep,undefined,targetSource);

        }else {

            var constructSpawn = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_SPAWN)
                }
            });

            if(creep.room?.controller && creep.room?.controller.my && creep.room?.controller.level < 2) {
                if(creep.room.controller && creep.room.controller.my &&
                    creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else if(constructSpawn.length) {
                if(creep.build(constructSpawn[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructSpawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    Builder.run(creep);
                }
            } else {
                Builder.run(creep)
            }

        }



    }

}

