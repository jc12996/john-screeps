import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Dismantler {


    private static dismantleTarget( creep: Creep, target: any) {

        if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
        }

    }

    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🧱');
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }

        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_CONTROLLER && creep.owner.username !== 'Invader'
            }
        });
        const findRamparts = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType === STRUCTURE_RAMPART && creep.owner.username !== 'Invader'
            }
        });

        const targetWallOrRampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter:  (struc) => {
                return  (struc.structureType === STRUCTURE_RAMPART || struc.structureType === STRUCTURE_WALL) && creep.owner.username !== 'Invader'
            }
        });


        const dismantleHere = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (struc) => {
                return  !!Game.flags.dismantleHere && Game.flags.dismantleHere?.pos && struc.pos.x == Game.flags.dismantleHere.pos.x && struc.pos.y == Game.flags.dismantleHere.pos.y
            }
        });

        const dismantleHere2 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (struc) => {
                return  !!Game.flags.dismantleHere2 && Game.flags.dismantleHere2?.pos && struc.pos.x == Game.flags.dismantleHere2.pos.x && struc.pos.y == Game.flags.dismantleHere2.pos.y
            }
        });


        const dismantleHere3 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (struc) => {
                return  !!Game.flags.dismantleHere3 && Game.flags.dismantleHere3?.pos && struc.pos.x == Game.flags.dismantleHere3.pos.x && struc.pos.y == Game.flags.dismantleHere3.pos.y
            }
        });


        const dismantleHere4 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (struc) => {
                return  !!Game.flags.dismantleHere4 && Game.flags.dismantleHere4?.pos && struc.pos.x == Game.flags.dismantleHere4.pos.x && struc.pos.y == Game.flags.dismantleHere4.pos.y
            }
        });

        const findTowers = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType === STRUCTURE_TOWER && creep.owner.username !== 'Invader'
            }
        });

        const findOther = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)  && creep.structureType !== STRUCTURE_RAMPART && creep.structureType !== STRUCTURE_CONTROLLER && creep.owner.username !== 'Invader'
            }
        });

        var findWalls = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (wall) => {
                return wall.structureType === STRUCTURE_WALL && wall.room?.controller?.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(wall.room?.controller?.owner) && creep.owner.username !== 'Invader'
            }
        });

        const enemyController = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter:  (structure) => {
                return !SpawnUtils.FRIENDLY_OWNERS_FILTER(structure.owner) && structure.structureType === STRUCTURE_CONTROLLER && creep.owner.username !== 'Invader'
            }
        });




        if(hostileStructures.length > 0 && Game.flags?.dismantleFlag && Game.flags?.dismantleFlag.room === creep.room) {

            if(dismantleHere && !findTowers && !findOther) {
                creep.say('🧱 T');
                Dismantler.dismantleTarget(creep,dismantleHere);
            } else if(dismantleHere2 && !findTowers && !findOther) {
                creep.say('🧱 T');
                Dismantler.dismantleTarget(creep,dismantleHere2);
            } else if(dismantleHere3 && !findTowers && !findOther) {
                creep.say('🧱 T');
                Dismantler.dismantleTarget(creep,dismantleHere3);
            } else if(dismantleHere4 && !findTowers && !findOther) {
                creep.say('🧱 T');
                Dismantler.dismantleTarget(creep,dismantleHere4);
            } else if(targetWallOrRampart && !findTowers && !findOther) {
                creep.say('🧱 T');
                Dismantler.dismantleTarget(creep,targetWallOrRampart);
            } else if(findRamparts && !findTowers && !findOther) {
                creep.say('🧱 t');
                Dismantler.dismantleTarget(creep,findRamparts);
            } else if(findTowers) {
                creep.say('🧱 t');
                Dismantler.dismantleTarget(creep,findTowers);
            }else if(findOther && findOther != enemyController) {
                creep.say('🧱 o');
                Dismantler.dismantleTarget(creep,findOther)
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
        } else if(dismantleHere && !Game.flags?.dismantleFlag) {
            creep.say('🧱 T');
            Dismantler.dismantleTarget(creep,dismantleHere);
        } else if(dismantleHere2 && !Game.flags?.dismantleFlag) {
            creep.say('🧱 T');
            Dismantler.dismantleTarget(creep,dismantleHere2);
        } else if(dismantleHere3 && !Game.flags?.dismantleFlag) {
            creep.say('🧱 T');
            Dismantler.dismantleTarget(creep,dismantleHere3);
        } else if(dismantleHere4 && !Game.flags?.dismantleFlag) {
            creep.say('🧱 T');
            Dismantler.dismantleTarget(creep,dismantleHere4);
        } else if(Game.flags?.dismantleFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.dismantleFlag);
        } else if(Game.flags?.attackFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
        } else if(Game.flags?.rallyFlag) {
            MovementUtils.defaultArmyMovement(creep,Game.flags?.rallyFlag);
        }

    }
}

