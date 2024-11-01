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

            const attackResult = creep.attack(target)

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

        creep.memory.isBoosted = undefined;
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

        var structures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTROLLER);
            }
        });
        var badStructures = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType != STRUCTURE_CONTROLLER
            }
        });

        var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)) || hostileCreep?.owner?.username === 'Invader')
                  }
            }
        );




        const hostileSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });

        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_RAMPART && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });

        const nearestHostileTower = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType == STRUCTURE_TOWER
            }
        });

        const walls = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter:  (creep) => {
                return  creep.structureType == STRUCTURE_WALL
            }
        });

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


        const wall = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_WALL
        });



        if(nearestHostileTower) {
            creep.say('⚔ T');
            Attacker.attackTarget(creep,nearestHostileTower);
            return;
        }



        if (!isSafeRoom && hostileCreeps) {
            creep.say('⚔ ⚔');
            Attacker.attackTarget(creep,hostileCreeps);
            return;
        }

        if(!isSafeRoom && structures.length > 0 && badStructures && Game.flags?.attackFlag) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,badStructures);
            return;
        }

        if (!isSafeRoom && hostileStructures.length > 0 && Game.flags?.attackFlag) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,hostileStructures[0])
            return;
        }

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
            if(creep.room === Game.flags.attackFlag?.room && hostileStructures.length === 0 && !hostileCreeps) {
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

