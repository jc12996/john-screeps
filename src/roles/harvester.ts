import { SpawnUtils } from "utils/SpawnUtils";
import { Builder } from "./builder";
import { Upgrader } from "./upgrader";
import { Position } from "source-map";
import { EconomiesUtils } from "utils/EconomiesUtils";

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

        let sources = creep.room.find(FIND_SOURCES_ACTIVE, {
            filter: (source) => {
                return source.room.controller?.my
            }
        });

        let finalSource:Source = sources[0];



        if(creep.memory.targetSource) {

            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏");
            }
            finalSource = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter:  (source) => {
                   return source.id == creep.memory.targetSource && source.room.controller?.my
                }
            }) ?? sources[0];

        }else {
            finalSource = Harvester.findTargetSource(creep) ?? sources[0];
        }


        if(finalSource?.pos && creep.pos && creep.pos.inRangeTo(finalSource.pos.x, finalSource.pos.y,1) && creep.memory.targetSource) {
            let sources = creep.room.find(FIND_SOURCES_ACTIVE, {
                filter: (source) => {
                    return source.id === creep.memory.targetSource
                }
            });
            if(!sources.length) {
                return;
            }

        }else if(finalSource?.pos && creep.pos && !creep.pos.inRangeTo(finalSource.pos.x, finalSource.pos.y,1) && creep.memory.targetSource) {
            creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            return;
        }

        if(!creep.memory.delivering) {



            if(creep.harvest(finalSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(creep.memory.targetSource && creep.memory.role !== 'settler' && creep.memory.targetSource && finalSource && creep.harvest(finalSource) === OK) {
                creep.drop(RESOURCE_ENERGY,creep.store.energy);
            } else {
                creep.memory.delivering = true;
            }

            // if(!creep.memory.targetSource && creep.room.name === 'W5N4') {
            //     console.log(finalSource.pos.x,finalSource.pos.y,finalSource.id,creep.pos.inRangeTo(finalSource.pos.x, finalSource.pos.y,2))
            // }

            if(creep.memory.role !== 'settler' && !creep.memory.targetSource && finalSource?.pos && creep.pos && creep.pos?.inRangeTo(finalSource.pos?.x, finalSource.pos?.y,2)) {
                creep.memory.targetSource = finalSource.id;
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

    private static findTargetSource(creep:Creep): Source | null {

        let sources = creep.room.find(FIND_SOURCES_ACTIVE);

        for (const source of sources) {



            const top = { x: source.pos.x, y: source.pos.y + 1, hasPlain: 0 };
            const topLeft = { x: source.pos.x -1 , y: source.pos.y + 1, hasPlain: 0 };
            const topRight = { x: source.pos.x +1 , y: source.pos.y + 1, hasPlain: 0 };
            const right = { x: source.pos.x +1 , y: source.pos.y, hasPlain: 0 };
            const left = { x: source.pos.x +1 , y: source.pos.y, hasPlain: 0 };
            const bottom = { x: source.pos.x , y: source.pos.y -1, hasPlain: 0 };
            const bottomLeft = { x: source.pos.x-1 , y: source.pos.y -1, hasPlain: 0 };
            const bottomRight = { x: source.pos.x+1 , y: source.pos.y -1, hasPlain: 0 };

            const squareAreas = [top,topLeft,topRight,right,left,bottom,bottomLeft,bottomRight];

            for(const area of squareAreas) {
                const areaPostion: Terrain[] = creep.room.lookForAt(LOOK_TERRAIN,area.x,area.y)
                if(areaPostion.includes('plain')) {
                    area.hasPlain++;
                }
            }

            const areasWithPlains = squareAreas.filter((area) => area.hasPlain > 0);

            for(const areawithPlain of areasWithPlains) {
                const hasCreep: Creep[] = creep.room.lookForAt(LOOK_CREEPS,areawithPlain.x,areawithPlain.y);

                if(hasCreep.length == 0) {

                    const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                        filter:  (ssss) => {
                           return ssss.id == source.id && creep.room.controller?.my
                        }
                    }) ?? source;

                    return finalSource;


                }

            }
        }
        return null;

    }

}
