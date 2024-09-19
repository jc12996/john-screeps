import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";


export class Claimer {



    public static run(creep: Creep): void {



        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚩');
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }

        //const room = new RoomPosition(AttackSequence.NEXT_BASE_TO_CLAIM.coord.x, AttackSequence.NEXT_BASE_TO_CLAIM.coord.y, AttackSequence.NEXT_BASE_TO_CLAIM.pos);

        if(creep.room.controller && !creep.room.controller.my) {

            const enemyController = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: function(object) {
                    return object.structureType === STRUCTURE_CONTROLLER && object.owner?.username !== 'Invader'
                }
            });



            if(!creep.pos.inRangeTo(creep.room.controller.pos.x,creep.room.controller.pos.y,1)) {
                creep.moveTo(creep.room.controller);
                return;
            }

            if(creep.memory.role === 'attackClaimer') {
                if(enemyController && creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }else if(Game.flags.attackClaim && Game.flags.attackClaim.room === creep.room && Game.flags.attackClaim.room?.controller?.owner === undefined){
                    Game.flags.attackClaim.remove();
                } else if(Game.flags.attackClaim2 && Game.flags.attackClaim2.room === creep.room && Game.flags.attackClaim2.room?.controller?.owner === undefined){
                    Game.flags.attackClaim2.remove();
                } else if(Game.flags.attackClaim3 && Game.flags.attackClaim3.room === creep.room && Game.flags.attackClaim3.room?.controller?.owner === undefined){
                    Game.flags.attackClaim3.remove();
                }
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

            if(claimTargetCreep) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(creep.room.controller);
                }

                if(creep.claimController(creep.room.controller) == OK) {

                }
            }
        }
    }

}

