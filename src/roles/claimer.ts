import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";


export class Claimer {



    public static run(creep: Creep): void {



        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚩');
        }

        const mineFlag = Game.flags[creep.memory.firstSpawnCoords+'MineFlag'];

        if(!!mineFlag && mineFlag.room !== creep.room) {
            MovementUtils.goToFlag(creep,mineFlag);
            return;
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }
        //const room = new RoomPosition(AttackSequence.NEXT_BASE_TO_CLAIM.coord.x, AttackSequence.NEXT_BASE_TO_CLAIM.coord.y, AttackSequence.NEXT_BASE_TO_CLAIM.pos);

        if(creep.room.controller && !creep.room.controller.my) {

            const enemyController = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: function(object) {
                    return object.structureType === STRUCTURE_CONTROLLER
                }
            });

            if(!creep.pos.inRangeTo(creep.room.controller.pos.x,creep.room.controller.pos.y,1)) {
                creep.moveTo(creep.room.controller);
                return;
            }

            if(enemyController && creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                //creep.moveTo(creep.room.controller);
            }else if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                //creep.moveTo(creep.room.controller);
            }

            const claimTargetCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.getActiveBodyparts(CLAIM) > 0;
                }
            });

            if(claimTargetCreep && !!!mineFlag) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(creep.room.controller);
                }

                if(creep.claimController(creep.room.controller) == OK) {

                }
            }
        }
    }

}

