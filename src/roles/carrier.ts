import { SpawnUtils } from "utils/SpawnUtils";
import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";

export class Carrier {

    public static run(creep: Creep, upgradeOnly:boolean = false): void {

        const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my


                )
            }
        });

        const extensionLinkFlag2= creep.room.find(FIND_FLAGS, {
            filter: (link) => {
                return link.name == creep.room.name+'ExtensionLink2'
            }
        });


        const links = creep.room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType === STRUCTURE_LINK


                )
            }
        });

        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn?.room.name);

        if(carriers.length > 0 && carriers[0] &&  creep.name === carriers[0].name) {
            creep.memory.extensionFarm1 = true;
            creep.memory.extensionFarm2 = false;
        } else if(extensionLinkFlag2 && links.length >= 3  && carriers.length > 0 && carriers[1] &&  creep.name === carriers[1].name) {
            creep.memory.extensionFarm1 = false;
            creep.memory.extensionFarm2 = true;
        } else {
            creep.memory.extensionFarm1 = false;
            creep.memory.extensionFarm2 = false;
        }

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
           if(creep.memory?.extensionFarm1){
            creep.say("🚚 X");
           } else if( creep.memory?.extensionFarm2){
            creep.say("🚚 X2");
           } else   {
            creep.say("🚚");
           }
        }




        const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50) && structure.room?.controller?.my; }
        });

        const extension = creep.pos.findInRange(FIND_STRUCTURES, 11, {
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

        var nearestSpawn = creep.pos.findInRange(FIND_STRUCTURES, 10, {
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

        const terminal =  creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TERMINAL && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const towers = creep.pos.findInRange(FIND_STRUCTURES, 10, {
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

        const extensionLinkFlag= creep.room.find(FIND_FLAGS, {
            filter: (link) => {
                return link.name == creep.room.name+'ExtensionLink'
            }
        });



        const nearestAvailableWorkingRoleCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter:  (creep) => {
                return (
                   (creep.memory.role === 'builder' || creep.memory.role === 'upgrader') && creep.store.getFreeCapacity() > 0)
            }
        });




        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })


        const capacitySpawnLimit = (creep.room.controller && creep.room.controller?.level > 4) ? 100 : 50;
        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > capacitySpawnLimit))) {
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





            const tombstones   = creep.pos.findInRange(FIND_TOMBSTONES, 9,{
                filter: (struc) => {
                    return struc.store[RESOURCE_ENERGY] > 0
                }
            });

            if(spawn && spawn?.pos && (creep.memory.extensionFarm2 || creep.memory.extensionFarm1) &&  creep.room?.controller  && creep.room?.controller.my) {


                if(creep.memory.extensionFarm2) {
                    const extensionFarm2Flag = Game.flags[spawn.room.name+'ExtensionFarm2'];
                    const extensionLink = getLinkByTag(creep,'ExtensionLink2');
                    if(creep.memory.role === 'carrier' && (nearestStorage || links.length >= 3) && creep.room?.controller?.level >= 6 && extensionFarm2Flag) {
                        creep.say("🚚 X2");
                        MovementUtils.xHarvesterMovementSequence(creep,extensionFarm2Flag,extensionLink,nearestStorage,nearestSpawn[0],towers,extension);

                    }
                    return;
                }

                const extensionLink1 = getLinkByTag(creep, 'ExtensionLink');
                if(creep.memory.role === 'carrier' && extensionLink1 && (nearestStorage || links.length >= 2) && creep.room?.controller?.level >= 5) {
                    creep.say("🚚 X");
                    MovementUtils.xHarvesterMovementSequence(creep,spawn,extensionLink1,nearestStorage,nearestSpawn[0],towers,extension);
                    return;
                }
            }




            let ruinsSource = creep.pos.findClosestByPath(FIND_RUINS, {
                filter:  (source) => {
                    return (
                        source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0


                    )
                }
            });


            if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedSources);
            } else if(tombstones[0] && creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tombstones[0]);
            } else if(containers && creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers);
            } else if(extensionLinkFlag2.length && creep.memory.extensionFarm2){
                creep.moveTo(extensionLinkFlag2[0]);
            } else if(extensionLinkFlag.length && creep.memory.extensionFarm1){
                creep.moveTo(extensionLinkFlag[0]);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            } else {
                MovementUtils.randomDirectionSelector();
            }


        } else if(creep.memory.carrying) {

            const largeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                       structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                    ) &&
                        structure.store[RESOURCE_ENERGY] > 200000;
                }
            });
            const prioritySpawn = (creep.room.controller && spawns && creep.room.controller?.level <= 4) ? spawns : nearestSpawn[0];

            if(upgradeOnly && nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XC");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2C");
                } else {
                    creep.say('🚚 C');
                }
                creep.moveTo(nearestAvailableWorkingRoleCreep);
                return;
            }

            if(!creep.memory?.extensionFarm1 && !creep.memory.extensionFarm2 && nearestStorage && links.length >= 4) {
                if(creep.store[RESOURCE_ENERGY] > 0 && nearestStorage  && creep.transfer(nearestStorage , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('🚚 S');
                    creep.moveTo(nearestStorage );


                } else if(roomRallyPointFlag.length) {
                    creep.moveTo(roomRallyPointFlag[0])
                }
            } else if(spawns?.room && spawns?.room.energyAvailable < 300 && extension.length && creep.transfer(extension[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XE");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2E");
                } else {
                    creep.say('🚚 E');
                }
                creep.moveTo(extension[0]);
            }else if(towers.length && creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XT");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2T");
                } else {
                    creep.say('🚚 T');
                }
                creep.moveTo(towers[0]);
            }else if(extension.length && !towers.length && creep.transfer(extension[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XE");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2E");
                } else {
                    creep.say('🚚 E');
                }
                creep.moveTo(extension[0]);
            }else if(!creep.memory.extensionFarm2 && !creep.memory.extensionFarm1 && spawns && !extension.length && !towers.length && creep.transfer(spawns, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XW");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2W");
                } else {
                    creep.say('🚚 W');
                }
                creep.moveTo(spawns);
            } else if((creep.memory.extensionFarm2 || creep.memory.extensionFarm1) && prioritySpawn && !extension.length && !towers.length && creep.transfer(prioritySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XW");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2W");
                } else {
                    creep.say('🚚 W');
                }
                creep.moveTo(prioritySpawn);
            } else  if(!creep.memory.extensionFarm2 && !largeStorage && storage && !spawns && !towers.length  && !extension.length && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XS");
                } else {
                    creep.say('🚚 S');
                }
                creep.moveTo(storage);
            } else if(nearestAvailableWorkingRoleCreep && !storage && !spawn && !towers.length  && !extension.length && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XC");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2C");
                } else {
                    creep.say('🚚 C');
                }
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            } else if(extensionLinkFlag[0] && creep.memory.extensionFarm1) {
                const extensionLink = getLinkByTag(creep, 'ExtensionLink');
                if(largeStorage && extensionLink && creep.transfer(extensionLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensionLink);
                    creep.say("🚚 XX");
                } else {
                    creep.moveTo(extensionLinkFlag[0].pos.x - 1, extensionLinkFlag[0].pos.y);
                }

            } else if(extensionLinkFlag2[0]  && creep.memory.extensionFarm2) {
                if(terminal && !nearestSpawn.length && !towers.length  && !extension.length && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say("🚚 X2TR");
                    creep.moveTo(terminal);
                } else {
                    creep.moveTo(extensionLinkFlag2[0].pos.x - 1, extensionLinkFlag2[0].pos.y);
                }
            }  else  if(nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XC");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2C");
                } else {
                    creep.say('🚚 C');
                }
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }

        } else if(creep.room.controller && creep.room.controller.my &&
            creep.upgradeController(creep.room.controller) == ERR_NO_BODYPART) {
            if(nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm1) {
                    creep.say("🚚 XC");
                } else if( creep.memory?.extensionFarm2){
                    creep.say("🚚 X2C");
                } else {
                    creep.say('🚚 C');
                }
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            }
        }else if(roomRallyPointFlag.length) {
            creep.moveTo(roomRallyPointFlag[0])
        }
    }
}

