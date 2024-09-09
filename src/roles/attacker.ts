import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";

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
                console.log('Attack Error',attackResult,creep.name,target)
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
        var findWalls = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_WALL}
        });



        const invaderCore = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter: { owner: { username: 'Invader' } }
        });



        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)) || hostileCreep?.owner?.username === 'Invader')
                  }
            }
        )[0] ?? null;



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


        const isSafeRoom = creep.room.controller?.safeMode ?? false;


        if (!isSafeRoom && hostileCreeps) {
            creep.say('⚔ ⚔');

            Attacker.attackTarget(creep,hostileCreeps)
        }
        else if(!isSafeRoom && structures.length > 0 && badStructures) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,badStructures)
        }
        else if (!isSafeRoom && hostileStructures.length > 0) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,hostileStructures[0])
        }
        else if (!isSafeRoom && hostileSites.length > 0) {
            creep.say('⚔ 🚧');
            Attacker.attackTarget(creep,hostileSites[0])
        }
        else if(!isSafeRoom && invaderCore){
            creep.say('⚔ I');
            Attacker.attackTarget(creep,invaderCore)
        } else if(!isSafeRoom && Game.flags?.attackFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
        } else if(Game.flags?.rallyFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.rallyFlag);
        }


    }

}

