import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";

export class Carrier {

    public static run(creep: Creep): void {
        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🚚");
        }




        const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50) && structure.room?.controller?.my; }
        });

        const extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_EXTENSION) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        var spawns = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TOWER && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        var nearestStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                )
            }
        });


        var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my


                )
            }
        });

        const extensionLinkFlag= creep.room.find(FIND_FLAGS, {
            filter: (link) => {
                return link.name == creep.room.name+'ExtensionLink'
            }
        });




        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);


        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })


        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > 0 && creep.store[RESOURCE_ENERGY] <= 250))) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }


        if(!creep.memory.carrying) {
            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount >= 50 && source.room?.controller?.my


                    )
                }
            });


            const links = creep.room.find(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                        structure.structureType === STRUCTURE_LINK


                    )
                }
            });



            const extensionLink = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter: (struc) => {
                    return struc.structureType === STRUCTURE_LINK && struc.pos.x == extensionLinkFlag[0].pos.x && struc.pos.y == extensionLinkFlag[0].pos.y
                }
            });
            if(creep.memory.role === 'carrier' && spawn && spawn && spawn.pos &&  creep.memory.extensionFarm1  && creep.room?.controller  && creep.room?.controller.my && creep.room?.controller?.level >= 5) {
                creep.moveTo(spawn.pos.x - 3, spawn.pos.y + 3)

                if(links.length >= 2 && extensionLink && creep.withdraw(extensionLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(extensionLink, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                }

                return;
            }


            let ruinsSource = creep.pos.findClosestByPath(FIND_RUINS, {
                filter:  (source) => {
                    return (
                        source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0


                    )
                }
            });


             if(ruinsSource && ruinsSource.store && creep.withdraw(ruinsSource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(ruinsSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(containers && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            } else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources);
            } else if(extensionLinkFlag.length){
                creep.moveTo(extensionLinkFlag[0]);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            } else {
                Upgrader.run(creep);
            }


        } else if(creep.memory.carrying) {


            if(carriers[0] && creep.id === carriers[0].id) {
                creep.memory.extensionFarm1 = true;
            } else {
                creep.memory.extensionFarm1 = false;
            }


            if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 T');
                creep.moveTo(towers);
            }else if(extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 E');
                creep.moveTo(extension);
            }else  if(spawns && creep.transfer(spawns, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 ES');
                creep.moveTo(spawns);
            }else  if(storage && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 S');
                creep.moveTo(storage);
            }

        }
    }
}

