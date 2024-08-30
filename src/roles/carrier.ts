import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";

export class Carrier {

    public static run(creep: Creep): void {
        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
           if( creep.memory?.extensionFarm1){
            creep.say("🚚 X");
           } else   {

               creep.say("🚚");
           }
        }


        const links = creep.room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType === STRUCTURE_LINK


                )
            }
        });


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
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.store[RESOURCE_ENERGY] < 800;
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

        if(carriers[0] &&  creep.name === carriers[0].name) {

            creep.memory.extensionFarm1 = true;
        } else {
            creep.memory.extensionFarm1 = false;
        }

        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })


        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > 100))) {
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





            const extensionLink = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter: (struc) => {
                    return struc.structureType === STRUCTURE_LINK && struc.pos.x == extensionLinkFlag[0].pos.x && struc.pos.y == extensionLinkFlag[0].pos.y  && struc.store[RESOURCE_ENERGY] > 0
                }
            });
            const tombstones   = creep.pos.findInRange(FIND_TOMBSTONES, 9,{
                filter: (struc) => {
                    return struc.store[RESOURCE_ENERGY] > 0
                }
            });
            if(creep.memory.role === 'carrier' && (storage || links.length >= 2) && spawn && spawn && spawn.pos &&  creep.memory.extensionFarm1  && creep.room?.controller  && creep.room?.controller.my && creep.room?.controller?.level >= 5) {
                creep.moveTo(spawn.pos.x - 3, spawn.pos.y + 3)
                   creep.say("🚚 X");




                if(tombstones[0] && creep.memory.extensionFarm1 && !extensionLink && creep.withdraw(tombstones[0] , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tombstones[0]);
                    return;
                } else if(extensionLink && creep.withdraw(extensionLink,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(extensionLink, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                } else if(storage && storage.room.energyAvailable  != storage.room.energyCapacityAvailable && creep.memory.extensionFarm1 && !extensionLink && creep.withdraw(storage , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
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
            } else if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources);
            } else if(tombstones[0] && creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tombstones[0]);
            } else if(containers && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            }  else if(extensionLinkFlag.length && creep.memory.extensionFarm1){
                creep.moveTo(extensionLinkFlag[0]);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            } else {
                Upgrader.run(creep);
            }


        } else if(creep.memory.carrying) {
            const nearestAvailableWorkingRoleCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter:  (creep) => {
                    return (
                       (creep.memory.role === 'builder' || creep.memory.role === 'repairer' || creep.memory.role === 'upgrader') && creep.store.getFreeCapacity() > 0)
                }
            });


            if(!creep.memory?.extensionFarm1 && nearestStorage && links.length >= 2) {
                if(creep.store[RESOURCE_ENERGY] > 0 && nearestStorage  && creep.transfer(nearestStorage , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(nearestStorage );


                } else if(roomRallyPointFlag.length) {
                    creep.moveTo(roomRallyPointFlag[0])
                }
            } else if(spawns?.room && spawns?.room.energyAvailable < 300 && extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XE");
                } else {
                    creep.say('🚚 E');
                }
                creep.moveTo(extension);
            }else if(towers && creep.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XT");
                } else {
                    creep.say('🚚 T');
                }
                creep.moveTo(towers);
            }else if(extension && !towers && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XE");
                } else {
                    creep.say('🚚 E');
                }
                creep.moveTo(extension);
            }else if(spawns && !extension && !towers && creep.transfer(spawns, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XW");
                } else {
                    creep.say('🚚 W');
                }
                creep.moveTo(spawns);
            }else  if(storage && !spawns && !towers  && !extension && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XS");
                } else {
                    creep.say('🚚 S');
                }
                creep.moveTo(storage);
            } else if(nearestAvailableWorkingRoleCreep && !storage && !spawns && !towers  && !extension && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XC");
                } else {
                    creep.say('🚚 C');
                }
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }

        } else if(roomRallyPointFlag.length) {
            creep.moveTo(roomRallyPointFlag[0])
        }
    }
}

