import { SpawnUtils } from "utils/SpawnUtils";
import { Builder } from "./builder";
import { Upgrader } from "./upgrader";
import { Position } from "source-map";
import { EconomiesUtils } from "utils/EconomiesUtils";
import { RoomUtils } from "utils/RoomUtils";
import { Carrier } from "./carrier";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { harvesterContainerSourceAndExtensionLinks } from "links";

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


        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_CONTAINER

                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        let sources = creep.room.find(FIND_SOURCES, {
            filter: (source) => {
                return source.room.controller?.my
            }
        });

        let finalSource:Source | null = Harvester.findTargetSource(creep);



        if(creep.memory.targetSource) {

            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏");
            }
            finalSource = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter:  (source) => {
                   return source.id == creep.memory.targetSource && source.room.controller?.my
                }
            });

        }

        if(!creep.memory.targetSource && finalSource?.pos && creep.pos && creep.pos?.inRangeTo(finalSource.pos?.x, finalSource.pos?.y,1)) {
            creep.memory.targetSource = finalSource.id;
        }

        if((!creep.memory?.targetSource || (finalSource?.id === creep.memory?.targetSource)) && finalSource?.pos && creep.pos && !creep.pos?.inRangeTo(finalSource.pos?.x, finalSource.pos?.y,1)) {
            creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            return;
        }


        if(finalSource?.pos && creep.pos && creep.pos.inRangeTo(finalSource.pos.x, finalSource.pos.y,1) && creep.memory.targetSource) {
            let sources = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return source.id === creep.memory.targetSource
                }
            });
            if(!sources.length) {
                return;
            }

        }

        finalSource = creep.pos.findClosestByPath(FIND_SOURCES);

        const sourceLink1Flag = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink1Flag'
            }
        })

        if(finalSource && creep.harvest(finalSource) == ERR_NOT_IN_RANGE && finalSource?.pos) {
            creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if(creep.pos && container?.pos && (creep?.pos.inRangeTo(container.pos.x,container.pos.y, 1) || sourceLink1Flag[0])) {

            harvesterContainerSourceAndExtensionLinks(creep);

            if(finalSource) {
                creep.memory.targetSource = finalSource.id;
            }
        } else if(finalSource && creep.harvest(finalSource) === OK) {
            creep.memory.targetSource = finalSource.id;
            creep.drop(RESOURCE_ENERGY,creep.store.energy);
            ScaffoldingUtils.createContainers(creep);
        }



    }

    private static findTargetSource(creep:Creep): Source | null {

        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if(source !== null) {
            const areasWithPlains = RoomUtils.getCreepProspectingSlots(source);

            for(const areawithPlain of areasWithPlains) {
                const hasCreep: Creep[] = creep.room.lookForAt(LOOK_CREEPS,areawithPlain.x,areawithPlain.y);

                if(hasCreep.length == 0) {

                    const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                        filter:  (ssss) => {
                           return source && ssss.id == source.id && creep.room.controller?.my
                        }
                    }) ?? source;

                    return finalSource;


                }

            }
        }


        return null;

    }

}
