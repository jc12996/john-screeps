import { SpawnUtils } from "utils/SpawnUtils";
import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { RoomUtils } from "utils/RoomUtils";
import { LabMapper } from "labs";

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

        const labs: StructureLab[] = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_LAB
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
        else if(isInSpawn1Room && storage && carriers.length > 2 && carriers[2] &&  creep.name === carriers[2].name && commandLevel === 8) {
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

        if(!creep.memory.carrying && creep.memory.extensionFarm === 3
            && (creep.store[RESOURCE_UTRIUM] > 0
            || creep.store[RESOURCE_LEMERGIUM] > 0
            || creep.store[RESOURCE_ZYNTHIUM] > 0
            || creep.store[RESOURCE_KEANIUM] > 0
            || creep.store[RESOURCE_HYDROGEN] > 0
            || creep.store[RESOURCE_ENERGY] > 0
            || creep.store[RESOURCE_OXYGEN] > 0
            || creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0
            || creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0
            || creep.store[RESOURCE_GHODIUM] > 0
        )) {
                creep.memory.carrying = true;
        }

        if(
            creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0 && creep.memory.extensionFarm !== 3

        ) {
            creep.memory.carrying = false;
        }
        if(creep.memory.extensionFarm === 3) {
            console.log(creep.memory.carrying)
        }

        if(creep.memory.carrying && creep.memory.extensionFarm === 3
            && creep.store[RESOURCE_UTRIUM] === 0
            && creep.store[RESOURCE_LEMERGIUM] === 0
            && creep.store[RESOURCE_ZYNTHIUM] === 0
            && creep.store[RESOURCE_KEANIUM] === 0
            && creep.store[RESOURCE_HYDROGEN] === 0
            && creep.store[RESOURCE_ENERGY] === 0
            && creep.store[RESOURCE_UTRIUM_LEMERGITE] === 0
            && creep.store[RESOURCE_ZYNTHIUM_KEANITE] === 0
            && creep.store[RESOURCE_GHODIUM] === 0

            && creep.store[RESOURCE_OXYGEN] === 0) {
                creep.memory.carrying = false;
        }



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


            if(creep.room.name === 'W1N6') {

            console.log(labs[LabMapper.RESOURCE_GH]?.id)
            }

            if(creep.memory.extensionFarm === 3 && terminal  && labs.length > 0) {
                    const canContinue = this.scienceCarrierSequence(creep, labs, terminal);
                    if(!canContinue) {
                        return;
                    }
                    return;


            }

            if(creep.memory.extensionFarm !== undefined && commandLevel >= 8) {
                if(terminal && creep.store[RESOURCE_LEMERGIUM] > 0) {

                    if(creep.transfer(terminal,RESOURCE_LEMERGIUM) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0) {

                    if(creep.transfer(terminal,RESOURCE_ZYNTHIUM_KEANITE) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0) {

                    if(creep.transfer(terminal,RESOURCE_UTRIUM_LEMERGITE) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_HYDROGEN] > 0) {

                    if(creep.transfer(terminal,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_ZYNTHIUM] > 0) {

                    if(creep.transfer(terminal,RESOURCE_ZYNTHIUM) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_KEANIUM] > 0) {

                    if(creep.transfer(terminal,RESOURCE_KEANIUM) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
                    return;
                }

                if(terminal && creep.store[RESOURCE_UTRIUM] > 0) {

                    if(creep.transfer(terminal,RESOURCE_UTRIUM) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal)
                    }
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

    private static scienceCarrierSequence(creep:Creep,labs:StructureLab[],terminal:StructureTerminal): boolean {



        const energyNuker: StructureNuker | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_NUKER && structure.store && structure.store[RESOURCE_ENERGY] < 300000;
            }
        }) ?? null;

        const ghodiumNuker: StructureNuker | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_NUKER && structure.store && structure.store[RESOURCE_GHODIUM] < 5000;
            }
        }) ?? null



        // Make sure every lab has some energy in it.
        let labsAreFull = true;
        let labNumber = 0;
        labs.forEach(lab => {
            labNumber++;
            if(lab.store[RESOURCE_ENERGY] < 2000) {
                labsAreFull = false;
                creep.say('🚚 X3L')
                if(creep.transfer(lab,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(lab);
                }
                return;
            }

        });

        const H_lab1 = labs[LabMapper.RESOURCE_HYDROGEN] ?? null
        const H_lab2 = labs[LabMapper.RESOURCE_HYDROGEN] ?? null
        const ZK_lab = labs[LabMapper.RESOURCE_ZK] ?? null
        const LU_lab = labs[LabMapper.RESOURCE_LU] ?? null
        const GH_lab = labs[LabMapper.RESOURCE_GH] ?? null

        const L_lab = labs[LabMapper.RESOURCE_LEMERGIUM] ?? null;
        const U_lab = labs[LabMapper.RESOURCE_UTRIUM] ?? null;


        const Z_lab = labs[LabMapper.RESOURCE_ZYNTHIUM] ?? null;
        const K_lab = labs[LabMapper.RESOURCE_KEANIUM] ?? null;

        console.log('ZK',ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] )
        console.log('ZK',LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] )

        if(GH_lab && ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] && LU_lab.store[RESOURCE_UTRIUM_LEMERGITE]) {
            console.log('creating ghodium!')
            GH_lab.runReaction(ZK_lab,LU_lab)
        }


        if (ZK_lab && Z_lab.store[RESOURCE_ZYNTHIUM] && K_lab.store[RESOURCE_KEANIUM]) {
            ZK_lab.runReaction(Z_lab,K_lab)
        }

        if (LU_lab && L_lab.store[RESOURCE_LEMERGIUM] && U_lab.store[RESOURCE_UTRIUM]) {
            LU_lab.runReaction(L_lab,U_lab)
        }

        if(ZK_lab && creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0 && ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] < 2200 && creep.store.ZK > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('U')
                console.log('lemergium amount: ',creep.store[RESOURCE_ZYNTHIUM_KEANITE])
                creep.say('🚚 X3L'+ RESOURCE_ZYNTHIUM_KEANITE)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(ZK_lab,RESOURCE_ZYNTHIUM_KEANITE) === ERR_NOT_IN_RANGE){
                creep.moveTo(ZK_lab);

            }
            return false;

        }



        if(terminal && creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0) {

            if(creep.transfer(terminal,RESOURCE_ZYNTHIUM_KEANITE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(LU_lab && creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0 && LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] < 2200 && creep.store.UL > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('U')
                console.log('lemergium amount: ',creep.store[RESOURCE_UTRIUM_LEMERGITE])
                creep.say('🚚 X3L'+ RESOURCE_UTRIUM_LEMERGITE)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(LU_lab,RESOURCE_UTRIUM_LEMERGITE) === ERR_NOT_IN_RANGE){
                creep.moveTo(LU_lab);

            }
            return false;

        }



        if(terminal && creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0) {

            if(creep.transfer(terminal,RESOURCE_UTRIUM_LEMERGITE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }


/*
        if(H_lab1  || H_lab2) {
            if(H_lab1 && creep.store[RESOURCE_HYDROGEN] > 0 && H_lab1.store[RESOURCE_HYDROGEN] < 3000) {
                if(!labsAreFull) {
                    creep.say('🚚 X3L'+ RESOURCE_HYDROGEN)
                }

                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }
                labsAreFull = false;
                if(creep.transfer(H_lab1,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE){
                    creep.moveTo(H_lab1);
                }

                return false;
            } else if(H_lab2 && creep.store[RESOURCE_HYDROGEN] > 0 && H_lab2.store[RESOURCE_HYDROGEN] < 3000) {
                if(!labsAreFull) {
                    creep.say('🚚 X3L'+ RESOURCE_HYDROGEN)
                }

                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }
                labsAreFull = false;
                if(creep.transfer(H_lab2,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE){
                    creep.moveTo(H_lab2);
                }

                return false;
            }
 */
            /*
            else if(H_lab3 && creep.store[RESOURCE_HYDROGEN] > 0 && H_lab3.store[RESOURCE_HYDROGEN] < 3000) {
                if(!labsAreFull) {
                    creep.say('🚚 X3L'+ RESOURCE_HYDROGEN)
                }

                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }
                labsAreFull = false;
                if(creep.transfer(H_lab3,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE){
                    creep.moveTo(H_lab3);
                }

                return false;
            } else if(H_lab4 && creep.store[RESOURCE_HYDROGEN] > 0 && H_lab4.store[RESOURCE_HYDROGEN] < 3000) {
                if(!labsAreFull) {
                    creep.say('🚚 X3L'+ RESOURCE_HYDROGEN)
                }

                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }
                labsAreFull = false;
                if(creep.transfer(H_lab4,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE){
                    creep.moveTo(H_lab4);
                }

                return false;
            } else if(H_lab5 && creep.store[RESOURCE_HYDROGEN] > 0 && H_lab5.store[RESOURCE_HYDROGEN] < 3000) {
                if(!labsAreFull) {
                    creep.say('🚚 X3L'+ RESOURCE_HYDROGEN)
                }

                if(creep.store[RESOURCE_ENERGY] > 0) {
                    creep.drop(RESOURCE_ENERGY)
                }
                labsAreFull = false;
                if(creep.transfer(H_lab5,RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE){
                    creep.moveTo(H_lab5);
                }

                return false;
            }
            */


        if(terminal && creep.store[RESOURCE_HYDROGEN] > 0) {

            if(creep.transfer(terminal,RESOURCE_HYDROGEN)  === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }



        if(L_lab && creep.store[RESOURCE_LEMERGIUM] > 0 && L_lab.store[RESOURCE_LEMERGIUM] < 2200 && creep.store.L > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('U')
                console.log('lemergium amount: ',creep.store[RESOURCE_LEMERGIUM])
                creep.say('🚚 X3L'+ RESOURCE_LEMERGIUM)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(L_lab,RESOURCE_LEMERGIUM) === ERR_NOT_IN_RANGE){
                creep.moveTo(L_lab);

            }
            return false;

        }

        if(terminal && creep.store[RESOURCE_LEMERGIUM] > 0) {

            if(creep.transfer(terminal,RESOURCE_LEMERGIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }



        if(U_lab && creep.store[RESOURCE_UTRIUM] > 0 && U_lab.store[RESOURCE_UTRIUM] < 2200 && creep.store.U > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('ultrium amount: ',creep.store[RESOURCE_UTRIUM])
                creep.say('🚚 X3L'+ RESOURCE_UTRIUM)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(U_lab,RESOURCE_UTRIUM) === ERR_NOT_IN_RANGE){
                creep.moveTo(U_lab);

            }
            return false;

        }

        if(terminal && creep.store[RESOURCE_UTRIUM] > 0) {

            if(creep.transfer(terminal,RESOURCE_UTRIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(Z_lab && creep.store[RESOURCE_ZYNTHIUM] > 0 && Z_lab.store[RESOURCE_ZYNTHIUM] < 2200 && creep.store.Z > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('Z')
                console.log('z amount: ',creep.store[RESOURCE_ZYNTHIUM])
                creep.say('🚚 X3L'+ RESOURCE_ZYNTHIUM)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(Z_lab,RESOURCE_ZYNTHIUM) === ERR_NOT_IN_RANGE){
                creep.moveTo(Z_lab);

            }
            return false;

        }

        if(terminal && creep.store[RESOURCE_ZYNTHIUM] > 0) {

            if(creep.transfer(terminal,RESOURCE_ZYNTHIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(K_lab && creep.store[RESOURCE_KEANIUM] > 0 && K_lab.store[RESOURCE_KEANIUM] < 2200 && creep.store.K > 0) {

            labsAreFull = false;
            if(!labsAreFull) {
                console.log('K')
                console.log('k amount: ',creep.store[RESOURCE_KEANIUM])
                creep.say('🚚 X3L'+ RESOURCE_KEANIUM)
            }

            if(creep.store[RESOURCE_ENERGY] > 0) {
                creep.drop(RESOURCE_ENERGY)
            }
            if(creep.transfer(K_lab,RESOURCE_KEANIUM) === ERR_NOT_IN_RANGE){
                creep.moveTo(K_lab);

            }
            return false;

        }

        if(terminal && creep.store[RESOURCE_KEANIUM] > 0) {

            if(creep.transfer(terminal,RESOURCE_KEANIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(terminal && creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0) {

            if(creep.transfer(terminal,RESOURCE_ZYNTHIUM_KEANITE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(terminal && creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0) {

            if(creep.transfer(terminal,RESOURCE_UTRIUM_LEMERGITE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }

        if(terminal && ghodiumNuker && creep.store[RESOURCE_GHODIUM] > 0) {

            if(ghodiumNuker && creep.transfer(ghodiumNuker,RESOURCE_GHODIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(ghodiumNuker)
            }else if(terminal && creep.transfer(terminal,RESOURCE_GHODIUM) === ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
            return false;
        }


        if(energyNuker && labsAreFull) {
            creep.say('🚚 X3N')
            if(energyNuker.store && energyNuker.store[RESOURCE_ENERGY] < 300000 && creep.transfer(energyNuker,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(energyNuker);

            }
            return false;
        }

        if(terminal  && terminal.store[RESOURCE_ENERGY] < 300000 && creep.transfer(terminal , RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.say('🚚 TR');
            creep.moveTo(terminal );
            return false;
        }

        return true;

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

