import { SpawnUtils } from "utils/SpawnUtils";
import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { RoomUtils } from "utils/RoomUtils";

export class Carrier {

    public static run(creep: Creep): void {

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
        const commandLevel =  creep.room?.controller?.level ?? 1;


        const storage:StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const terminal: StructureTerminal | null =  creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TERMINAL && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) ?? null;


        const nearestStorageOrTerminal: StructureTerminal | StructureStorage | null = creep.pos.findClosestByPath((FIND_STRUCTURES),{
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_TERMINAL || structure.structureType === STRUCTURE_STORAGE)  &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.room?.controller?.my;
                }
            } )

        const isInSpawn1Room = creep.room.find(FIND_MY_SPAWNS, {
            filter: (mySpawn) => {
                return mySpawn.name === 'Spawn1'
            }
        })[0] ?? null


        //console.log(creep.room.name,creep.room.energyCapacityAvailable)
        if(((terminal && terminal.store[RESOURCE_ENERGY] > 2000) || (creep.room.energyCapacityAvailable > 1000 )) && extensionLinkFlag2 && creep.room.energyAvailable > 0 && links.length >= 2  && carriers.length > 0 && carriers[1] &&  creep.name === carriers[1].name) {
            creep.memory.extensionFarm = 2;
        }else if(((storage && storage.store[RESOURCE_ENERGY] > 2000) || creep.room.energyCapacityAvailable > 1000) && carriers[0] &&  creep.name === carriers[0].name && creep.room.energyAvailable > 0) {
            creep.memory.extensionFarm = 1;
        }
        else if(isInSpawn1Room && ((storage && storage.store[RESOURCE_ENERGY] > 100000)) && carriers.length > 2 && carriers[2] &&  creep.name === carriers[2].name && commandLevel === 8) {
            creep.memory.extensionFarm = 3;
        }
        else {
            creep.memory.extensionFarm = undefined;
        }

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
           if(creep.memory?.extensionFarm === 1){
            creep.say("🚚 X");
           } else if( creep.memory?.extensionFarm === 2){
            creep.say("🚚 X2");
            // creep.drop(RESOURCE_HYDROGEN)
           } else if( creep.memory?.extensionFarm === 3){
            creep.say("🚚 X3");
           }else   {
            creep.say("🚚");
           }
        }

        let extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_EXTENSION) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

                const playerHostiles = creep.room.find(FIND_HOSTILE_CREEPS,
            {
                filter: (hostileCreep) => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner) && hostileCreep.getActiveBodyparts(ATTACK) > 0) && hostileCreep?.owner?.username !== 'Invader')
                  }
            }
        );
        if(commandLevel <= 6 && playerHostiles.length > 0 && creep.room.controller?.my) {
            creep.room.controller.activateSafeMode();
        }

        let spawns = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) ?? null;

        var nearestSpawn = creep.pos.findInRange(FIND_STRUCTURES, 10, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });



        const towers = creep.pos.findInRange(FIND_STRUCTURES, 10, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_TOWER && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.store[RESOURCE_ENERGY] < 800 && carriers.length && ((commandLevel >=  6 && creep.room.energyAvailable > 800) || (commandLevel < 6));
            }
        });

        var nearestStorage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
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


        const capacitySpawnLimit = (creep.room.controller && creep.room.controller?.level > 6) ? 100 : 50;
        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || (creep.store[RESOURCE_ENERGY] > capacitySpawnLimit))) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store.getCapacity() == 0) {
            creep.memory.carrying = false;
        }


        // const nukerEnergy: StructureNuker | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return structure.structureType === STRUCTURE_NUKER && structure.store  &&  structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
        //     }
        // }) ?? null;

        // if(!nukerEnergy) {
        //     creep.drop(RESOURCE_HYDROGEN)
        // }


        if(!creep.memory.carrying) {

            if(spawn && spawn?.pos && (creep.memory.extensionFarm === 2 || creep.memory.extensionFarm === 1) &&  creep.room?.controller  && creep.room?.controller.my) {


                if(creep.memory.extensionFarm === 2) {
                    const extensionFarm2Flag = Game.flags[spawn.room.name+'ExtensionFarm2'];
                    const extensionLink = getLinkByTag(creep,'ExtensionLink2');
                    if(creep.memory.role === 'carrier' && (nearestStorage || links.length >= 3) && creep.room?.controller?.level >= 6 && extensionFarm2Flag) {
                        creep.say("🚚 X2");
                        MovementUtils.xHarvesterMovementSequence(creep,extensionFarm2Flag,extensionLink,nearestStorage,terminal);

                    }
                    return;
                }

                const extensionLink1 = getLinkByTag(creep, 'ExtensionLink');
                if(creep.memory.role === 'carrier' && (nearestStorage || extensionLink1 || links.length >= 1) && creep.room?.controller?.level >= 5) {
                    creep.say("🚚 X");
                    MovementUtils.xHarvesterMovementSequence(creep,spawn,extensionLink1,nearestStorage,terminal);
                    return;
                }
            }



            MovementUtils.generalGatherMovement(creep)


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




            if(creep.memory.extensionFarm === 3 && terminal) {
                console.log('here',creep.name)
                const labs: StructureLab[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_LAB
                    }
                });
                if(labs.length > 0) {
                    this.scienceCarrierSequence(creep, labs);
                    return;
                }

            }

            this.normalCarrierSequence(creep,
                carriers,
                terminal,
                roomRallyPointFlag,
                nearestStorage,
                spawns,
                extension,
                links,
                towers,
                prioritySpawn,
                largeStorage,
                storage,
                nearestAvailableWorkingRoleCreep,
                extensionLinkFlag,
                spawn,
                extensionLinkFlag2,
                nearestSpawn,
                nearestStorageOrTerminal
            );



        } else if(creep.room.controller && creep.room.controller.my &&
            creep.upgradeController(creep.room.controller) == ERR_NO_BODYPART) {
            if(nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.memory?.extensionFarm === 1) {
                    creep.say("🚚 XC");
                } else if( creep.memory?.extensionFarm === 2){
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

    private static scienceCarrierSequence(creep:Creep, labs:StructureLab[]) {

        // // Make sure the nuke is full of energy
        // if(nukerEnergy) {
        //     if(creep.store[RESOURCE_ENERGY] === 0) {
        //         creep.memory.carrying = false;
        //         return;
        //     }
        //     creep.say('🚚 X3N')
        //     if(creep.transfer(nukerEnergy,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {

        //         creep.moveTo(nukerEnergy);
        //         return;
        //     }
        // }




        // Make sure every lab has some energy in it.
        let labsAreFull = true;
        labs.forEach(lab => {
            if(lab.store[RESOURCE_ENERGY] < lab.store.getCapacity(RESOURCE_ENERGY)) {
                labsAreFull = false;
                if(creep.transfer(lab,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(lab);
                }
                return;
            }

        });


        let labNumber = 0;
        let labMap: Array<RESOURCE_LEMERGIUM | RESOURCE_UTRIUM | RESOURCE_KEANIUM | RESOURCE_ZYNTHIUM | RESOURCE_HYDROGEN> = [];
        labMap[0] = RESOURCE_LEMERGIUM;
        labMap[1] = RESOURCE_UTRIUM;
        labMap[2] = RESOURCE_KEANIUM;
        labMap[3] = RESOURCE_ZYNTHIUM;
        labMap[4] = RESOURCE_HYDROGEN;
        labs.forEach(lab => {
            const resource  = labMap[labNumber];
            if(resource && lab && (lab.store.getFreeCapacity(resource) === 0 || lab.store[resource] > 0)  && lab.store[resource] < lab.store.getCapacity(resource)) {
                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }

                if(creep.store[resource] === 0) {
                    creep.memory.carrying = false;
                    return;
                }
                console.log(resource)
                labsAreFull = false;
                if(creep.transfer(lab,resource) === ERR_NOT_IN_RANGE){
                    creep.moveTo(lab);
                }


                return;
            }
            labNumber++;

        });

        if(!labsAreFull) {
            creep.say('🚚 X3L')
        }



    }

    private static normalCarrierSequence(
        creep: Creep,
        carriers: any,
        terminal: any,
        roomRallyPointFlag: any,
        nearestStorage: any,
        spawns: any,
        extension: any,
        links: any,
        towers: any,
        prioritySpawn: any,
        largeStorage: any,
        storage:any,
        nearestAvailableWorkingRoleCreep: any,
        extensionLinkFlag:any,
        spawn: any,
        extensionLinkFlag2:any,
        nearestSpawn: any,
        nearestStorageOrTerminal: any
    ) {




        if(creep.memory.role === 'miner' && creep.room.controller?.my) {
            if( nearestStorageOrTerminal && creep.transfer(nearestStorageOrTerminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
                creep.say('🚚 P');
                creep.moveTo(nearestStorageOrTerminal);
            } else if(nearestStorage  && creep.transfer(nearestStorage , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 S');
                creep.moveTo(nearestStorage );
            }else if(terminal  && creep.transfer(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 TR');
                creep.moveTo(terminal );
            } else if(nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 C');
                creep.moveTo(nearestAvailableWorkingRoleCreep);
            } else if(creep.room.controller?.my) {
                creep.drop(RESOURCE_ENERGY);
            }


        } else if(spawns?.room && spawns?.room.energyAvailable < 300 && extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XE");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2E");
            } else {
                creep.say('🚚 E');
            }
            creep.moveTo(extension);
        }
        else if(towers.length && creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XT");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2T");
            } else {
                creep.say('🚚 T');
            }
            creep.moveTo(towers[0]);
        }
        else if(carriers.length > 2 && nearestStorageOrTerminal && (creep.memory?.extensionFarm === undefined || creep.memory?.extensionFarm === 3)  &&  creep.transfer(nearestStorageOrTerminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
            creep.say('🚚 P');
            creep.moveTo(nearestStorageOrTerminal);
        }
        else if(carriers.length > 2 && (creep.memory?.extensionFarm === undefined || creep.memory?.extensionFarm === 3) && nearestStorage  && links.length >= 3 ) {


            if(creep.store[RESOURCE_ENERGY] > 0 && nearestStorage  && creep.transfer(nearestStorage , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 S');
                creep.moveTo(nearestStorage );


            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
        }else if(carriers.length > 2 && (creep.memory?.extensionFarm === undefined || creep.memory?.extensionFarm === 3) && terminal && terminal.store[RESOURCE_ENERGY] < 300000) {

            if(creep.store[RESOURCE_ENERGY] > 0 && terminal  && creep.transfer(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('🚚 TR');
                creep.moveTo(terminal );


            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
        }
        else if(creep.memory.extensionFarm === undefined && spawns && !extension && (!towers.length || carriers.length <= 2 ) && creep.transfer(spawns, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XW");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2W");
            } else {
                creep.say('🚚 W');
            }
            creep.moveTo(spawns);
        }
        else if((creep.memory.extensionFarm === 2 || creep.memory.extensionFarm === 1) && prioritySpawn && !extension && (!towers.length || carriers.length <= 2 ) && creep.transfer(prioritySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XW");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2W");
            } else {
                creep.say('🚚 W');
            }
            creep.moveTo(prioritySpawn);
        }

        else if(extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XE");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2E");
            } else {
                creep.say('🚚 E');
            }
            creep.moveTo(extension);
        }
        else  if(creep.memory.extensionFarm !== 2 && !largeStorage && storage && !spawns && (!towers.length || carriers.length <= 2 )  && !extension && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XS");
            } else {
                creep.say('🚚 S');
            }
            creep.moveTo(storage);
        } else if(creep.memory.extensionFarm === undefined && nearestAvailableWorkingRoleCreep && !storage && !spawn && (!towers.length || carriers.length <= 2 )  && !extension && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XC");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2C");
            } else {
                creep.say('🚚 C');
            }
            creep.moveTo(nearestAvailableWorkingRoleCreep);
        } else if(creep.room.energyAvailable == creep.room.energyCapacityAvailable && extensionLinkFlag[0] && creep.memory.extensionFarm === 1) {


            if(largeStorage && creep.transfer(largeStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(largeStorage);
                creep.say("🚚 XS");
            } else {
                creep.moveTo(extensionLinkFlag[0].pos.x - 1, extensionLinkFlag[0].pos.y);
            }

        }
        else if(extensionLinkFlag2[0]  && (creep.memory.extensionFarm === 2)) {
            if(terminal && !nearestSpawn.length && !towers.length  && !extension && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say("🚚 X2TR");
                creep.moveTo(terminal);
            } else {
                creep.moveTo(extensionLinkFlag2[0].pos.x - 1, extensionLinkFlag2[0].pos.y);
            }
        }
        else  if(nearestAvailableWorkingRoleCreep && creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.memory?.extensionFarm === 1) {
                creep.say("🚚 XC");
            } else if( creep.memory?.extensionFarm === 2){
                creep.say("🚚 X2C");
            } else {
                creep.say('🚚 C');
            }
            creep.moveTo(nearestAvailableWorkingRoleCreep);
        } else if(roomRallyPointFlag.length) {
            creep.moveTo(roomRallyPointFlag[0])
        }
    }
}

