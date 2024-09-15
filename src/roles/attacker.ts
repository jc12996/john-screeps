import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";

export class Attacker {


    private static attackTarget(creep: Creep,target: any) {

        if(target) {

            if(creep.getActiveBodyparts(RANGED_ATTACK) > 0 && creep.rangedAttack(target) !== ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#FF0000'}});
            } else if(creep.getActiveBodyparts(ATTACK) > 0 && creep.rangedAttack(target) !== ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#FF0000'}});
            }
        }
    }

    public static run(creep: Creep): void {
        creep.say('⚔');

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
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });

        const walls = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (creep) => {
                return  creep.structureType == STRUCTURE_WALL
            }
        });


        const isSafeRoom = creep.room.controller?.safeMode ?? false;


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

        if(!isSafeRoom && Game.flags?.attackFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
            return;
        }

        if(!!Game.flags?.rallyFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);
            return;
        }


    }

}

