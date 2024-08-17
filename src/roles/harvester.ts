import { SpawnUtils } from "utils/SpawnUtils";
import { Builder } from "./builder";
import { Upgrader } from "./upgrader";

export class Harvester {

    private static sourcePriority(source: any) {
        let priority;
        if (!source?.ticksToRegeneration) {
            priority = 10;
        } else if (source.energy == 0) {
            priority = 0;
        } else {
            priority = source.energy / source.ticksToRegeneration;
        }
        if (source?.ticksToRegeneration && priority > 0 && source?.ticksToRegeneration < 150) {
            priority = priority * (1 + (150 - source.ticksToRegeneration)/250);
            if (source.ticksToRegeneration < 70) {
                priority = priority + (70 - source.ticksToRegeneration)/10;
            }
        }
        return priority;
    };

    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🔄');
        }

        if(creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.delivering && creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('⚡ deliver');
        }


        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_CONTAINER

                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });




        let sources = creep.room.find(FIND_SOURCES_ACTIVE);

        let chosenSource: any = {id:0, priority: 0};
        for(const source of sources) {

            const chosenPriority = this.sourcePriority(source);
            if(((!chosenSource?.id && !chosenSource?.priority) || ((chosenSource?.id && chosenSource?.priority) && chosenPriority > chosenSource.priority)) && source.id && chosenPriority) {
                chosenSource.id = source.id;
                chosenSource.priority = chosenPriority;
            }


        }

        let targetSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
            filter: (source) => {
                return source.id === chosenSource.id
            }
        });

        if(creep.memory.targetSource) {

            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏");
            }
            targetSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                filter:  (source) => {
                   return source.id == creep.memory.targetSource
                }
            });
        }



        // console.log(chosenSource.id, chosenSource.priority);



        if(!creep.memory.delivering) {

            if(targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(creep.memory.role !== 'settler' && targetSource && creep.harvest(targetSource) === OK) {
                creep.drop(RESOURCE_ENERGY,creep.store.energy);
            } else if(creep.memory.role !== 'settler' && !container && creep.store.getFreeCapacity() > 0) {
                creep.memory.delivering = true;
            }

            if(creep.memory.role !== 'settler' && !creep.memory.targetSource && targetSource?.pos && creep.pos.isNearTo(targetSource.pos.x, targetSource.pos.y)) {
                creep.memory.targetSource = targetSource.id;
            }

            if(creep.memory.role === 'settler') {
                return;
            }
        }
        else {


            var extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION


                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType == STRUCTURE_SPAWN


                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });



            let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);



            if(spawn && (!container || !carriers.length)) {
                if(extensions && creep.transfer(extensions, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions, {visualizePathStyle: {stroke: '#ffffff'}});
                } else if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(container) {
                if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (!container && extensions && creep.transfer(extensions, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(extensions, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if(!container && spawn && creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
}
