import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Upgrader {
    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('⚡');
        }

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })




        if(creep.memory.upgrading) {
            if(creep.room.controller && creep.room.controller.my &&
                creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
        }
        else {




            const target_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my

                //     ||
                //     (spawn &&  ((structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] > 200) || structure.structureType == STRUCTURE_CONTAINER))  ||
                // (!extensions && spawn &&
                //     structure.structureType == STRUCTURE_SPAWN)) && structure.store[RESOURCE_ENERGY] > 0;
            )}
            });



               const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount > 10 && source.room?.controller?.my


                    )
                }
            });

            const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100) && structure.room?.controller?.my; }
            });

            if(target_storage && creep.withdraw(target_storage[target_storage.length -1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target_storage[target_storage.length -1]);
            } else if(!target_storage && containers && creep.withdraw(containers,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            }
            else if(!target_storage && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources);
            }
            else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
            // else {
            //     creep.move(MovementUtils.randomDirectionSelector())
            // }
        }
    }
}
