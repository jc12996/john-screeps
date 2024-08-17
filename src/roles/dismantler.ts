import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Dismantler {


    private static dismantleTarget( creep: Creep, target: any) {
        if(target) {
            creep.moveTo(target);
            const dismantleTarget = creep.dismantle(target)
            if(dismantleTarget == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }

            if(dismantleTarget === OK) {
                return;
            }

            if(dismantleTarget !== ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }else {
                console.log('Dismantle Error',dismantleTarget,creep.name,target)
            }
        }
    }

    public static run(creep: Creep): void {

        creep.say('🧱');

        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });
        const findRamparts = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType === STRUCTURE_RAMPART
            }
        });

        const hostileSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });

        const findTowers = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType === STRUCTURE_TOWER
            }
        });

        const findOther = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });

        var findWalls = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (wall) => {
                return wall.structureType === STRUCTURE_WALL && wall.room?.controller?.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(wall.room?.controller?.owner)
            }
        });

        const enemyController = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (structure) => {
                return !SpawnUtils.FRIENDLY_OWNERS_FILTER(structure.owner) && structure.structureType === STRUCTURE_CONTROLLER
            }
        });


        if(hostileStructures.length > 0) {
            if(Game.flags?.dismantleFlag) {
                creep.say('🧱 ⌖');
                Dismantler.dismantleTarget(creep, Game.flags?.dismantleFlag);
            }else if(findRamparts) {
                creep.say('🧱 r');
                Dismantler.dismantleTarget(creep,findRamparts);
            }
            else if(findTowers) {
                creep.say('🧱 t');
                Dismantler.dismantleTarget(creep,findTowers);
            }
            else if(findOther && findOther != enemyController) {
                creep.say('🧱 o');
                Dismantler.dismantleTarget(creep,findOther)
            } else if (hostileSites) {
                creep.say('🧱 s');
                Dismantler.dismantleTarget(creep,hostileSites)
            }
            else if(findWalls) {
                creep.say('🧱 w');
                Dismantler.dismantleTarget(creep,findWalls);
            }
            else {
                if(Game.flags.rallyFlag) {
                    MovementUtils.goToRally(creep);
                } else {
                    MovementUtils.goToAttackFlag(creep);
                }
            }
        } else if(Game.flags?.dismantleFlag && Game.flags?.attackFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.dismantleFlag);
        } else if(Game.flags?.attackFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
        } else if(Game.flags?.rallyFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.rallyFlag);
        }

    }
}

