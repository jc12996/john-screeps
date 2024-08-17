import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Attacker } from "./attacker";

export class Defender {
    public static run(creep: Creep): void {

            var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter:  (creep) => {
                    return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
                }
            });
            var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                filter:  (creep) => {
                    return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
                }
            });

            var badSpawns = creep.room.find(FIND_HOSTILE_SPAWNS, {
                filter:  (creep) => {
                    return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
                }

            });

            var hostileActiveTowers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                filter: (tower) => {
                    return tower.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(tower.owner) && tower.structureType == STRUCTURE_TOWER && tower.store[RESOURCE_ENERGY] != 0
                }
            });

            const nearestExit = creep.pos.findClosestByPath(FIND_EXIT);

           const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE)
            }
           })


            if(hostileActiveTowers.length > 0 && nearestExit) {
               creep.moveTo(nearestExit);
            } else if (hostileCreeps.length > 0) {
                // creep.say('🛡 defend!!');
                // let attackResult = null;
                // if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                //     attackResult = creep.rangedAttack(badSpawns[0])
                // } else {
                //     attackResult = creep.attack(badSpawns[0])
                // }
                // if(attackResult == ERR_NOT_IN_RANGE) {
                //         creep.moveTo(hostileCreeps[0], {visualizePathStyle: {stroke: '#ff0000'}});
                // }
                Attacker.run(creep);
            } else if (hostileStructures.length > 0) {
                creep.say('🛡 BUILDING!!');
                let attackResult = null;
                if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    attackResult = creep.rangedAttack(badSpawns[0])
                } else {
                    attackResult = creep.attack(badSpawns[0])
                }
                if(attackResult == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostileStructures[0], {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }  else if (badSpawns.length > 0) {
                creep.say('🛡 SPAWN!!');
                let attackResult = null;
                if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    attackResult = creep.rangedAttack(badSpawns[0])
                } else {
                    attackResult = creep.attack(badSpawns[0])
                }
                if(attackResult == ERR_NOT_IN_RANGE) {
                        creep.moveTo(badSpawns[0], {visualizePathStyle: {stroke: '#ff0000'}});
                }
            } else
                if(Game.flags?.draftFlag) {
                    creep.say('🛡');
                    MovementUtils.goToFlag(creep,Game.flags?.draftFlag)
                } else if(roomRallyPointFlag.length) {
                    creep.say('🛡');
                    MovementUtils.goToFlag(creep,roomRallyPointFlag[0])
                } else if(Game.flags?.rallyFlag && !creep.room.find(FIND_FLAGS)) {
                    creep.say('🛡');
                    MovementUtils.goToFlag(creep,Game.flags?.rallyFlag)
                } else {
                    creep.say('🛡');
                    creep.move(MovementUtils.randomDirectionSelector());
                }
            }
        }
