import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";
import { Labs } from "labs";

export class Attacker {


    private static attackTarget(creep: Creep,target: any) {

        const nearestExit = creep.room.find(FIND_EXIT_TOP)

        if(target) {

            let isNearExt = false;
            nearestExit.forEach(exit => {
                if(exit == target.pos) {
                    isNearExt = true;
                }
            });

            if(!isNearExt) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#FF0000'}});
            }

            let attackResult = null;
            if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                attackResult = creep.rangedAttack(target)
            } else {
                attackResult = creep.attack(target)
            }


            if(attackResult === OK) {
                return;
            }

            if(attackResult !== ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#FF0000'}});
            }else {
                //console.log('Attack Error',attackResult,creep.name,target)
            }
        }
    }

    public static run(creep: Creep): void {

        if(creep.memory.role === 'meatGrinder') {
            creep.say('🍖');
        }else {
            creep.say('⚔');
        }

        // if(creep.room.name === 'E29S36') {
        //     for(const flag of creep.room.find(FIND_FLAGS)) {
        //       flag.remove();
        //     }
        //    }

        if(!creep.memory.isBoosted) {
            const canContinue = Labs.boostCreep(creep)
            if(!canContinue) {
                return;
            }
        }

        if(!Game.flags?.rallyFlag && !Game.flags?.attackFlag && creep.memory.role !== 'defender') {
            //Defender.run(creep);
            return;
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }

        var hostileInvaderStructures = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES,
            {
                filter: hostileCreep => {
                    return (hostileCreep.owner && hostileCreep?.owner?.username === 'Invader')
                  }
            }
        );
        let invaderCore = null;
        if(creep.room.controller?.reservation && hostileInvaderStructures) {
            invaderCore = hostileInvaderStructures;
        }

        const isSafeRoom = creep.room.controller?.safeMode ?? false;


        const nearestHostileTower = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType == STRUCTURE_TOWER
            }
        });

        if(nearestHostileTower) {
            creep.say('⚔ T');
            Attacker.attackTarget(creep,nearestHostileTower);
            return;
        }



        var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)) || hostileCreep?.owner?.username === 'Invader')
                  }
            }
        );

        if (!isSafeRoom && hostileCreeps) {
            creep.say('⚔ ⚔');
            Attacker.attackTarget(creep,hostileCreeps);
            return;
        }


        var badStructures = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType != STRUCTURE_CONTROLLER
            }
        });

        var structures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTROLLER);
            }
        });

        if(!isSafeRoom && structures.length > 0 && badStructures && Game.flags?.attackFlag) {
            creep.say('⚔ 🚧');

            const dismantleHere = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter:  (struc) => {
                    return  !!Game.flags.dismantleHere && Game.flags.dismantleHere?.pos && struc.pos.x == Game.flags.dismantleHere.pos.x && struc.pos.y == Game.flags.dismantleHere.pos.y
                }
            });

            if(dismantleHere) {
                creep.say('🧱 T');
                Attacker.attackTarget(creep,dismantleHere);
            } else {
                Attacker.attackTarget(creep,badStructures);
            }


            return;
        }


        const hostileStructures = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_RAMPART && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });

        if (!isSafeRoom && hostileStructures && Game.flags?.attackFlag) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,hostileStructures)
            return;
        }

        const hostileSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });

        if (!isSafeRoom && hostileSites.length > 0 && Game.flags?.attackFlag) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,hostileSites[0])
            return;
        }



        if(invaderCore) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,invaderCore)
            return;
        }

        if(!isSafeRoom && Game.flags?.attackFlag) {

            if(Game.flags.attackFlag && Game.flags.attackFlag.room?.controller?.my && Game.flags.attackFlag.room.controller.safeMode){
                Game.flags.attackFlag.remove();
                if(Game.flags.scoutFlag) {
                    Game.flags.scoutFlag.remove();
                }

            }
            if(creep.room === Game.flags.attackFlag?.room  && !hostileCreeps) {
                Game.flags.attackFlag.remove();
                if(Game.flags.scoutFlag) {
                    Game.flags.scoutFlag.remove();
                }
            }
            MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
            return;
        }

        if(!!Game.flags?.rallyFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);
            return;
        }


    }

}

