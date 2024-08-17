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

        if(creep.memory.upgrading) {
            if(creep.room.controller &&
                creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {

            let hasStorage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return structure.structureType === STRUCTURE_STORAGE }
            });
            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType == STRUCTURE_SPAWN


                    )
                }
            });
            const extensions = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_EXTENSION)
                }
            });

            const target_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    structure.structureType == STRUCTURE_STORAGE
                //     ||
                //     (spawn &&  ((structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] > 200) || structure.structureType == STRUCTURE_CONTAINER))  ||
                // (!extensions && spawn &&
                //     structure.structureType == STRUCTURE_SPAWN)) && structure.store[RESOURCE_ENERGY] > 0;
            )}
            });

            const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
                filter: (flag) => {
                    return (flag.color == COLOR_BLUE)
                }
               })

            if(target_storage && creep.withdraw(target_storage[target_storage.length -1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target_storage[target_storage.length -1]);
            }
            else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
            else {
                creep.move(MovementUtils.randomDirectionSelector())
            }
        }
    }
}
