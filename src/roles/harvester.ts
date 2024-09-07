import { SpawnUtils } from "utils/SpawnUtils";
import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { placeSourceLinks } from "links";

export class Harvester {

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
                return site.name == creep.room.name+'SourceLink1'
            }
        })

        if(finalSource && creep.harvest(finalSource) == ERR_NOT_IN_RANGE && finalSource?.pos) {
            creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if(creep.pos && container?.pos && (creep?.pos.inRangeTo(container.pos.x,container.pos.y, 1) || sourceLink1Flag.length > 0)) {

            placeSourceLinks(creep);

            const sourceLink1 = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter: (struc) => {
                    return struc.structureType === STRUCTURE_LINK
                }
            })


            if(sourceLink1 && creep?.pos.inRangeTo(sourceLink1.pos.x,sourceLink1.pos.y, 1 )) {
                creep.transfer(sourceLink1, RESOURCE_ENERGY)
            }else if(container) {
                creep.transfer(container, RESOURCE_ENERGY);
            }


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
