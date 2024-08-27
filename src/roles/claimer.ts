import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";


export class Claimer {



    public static run(creep: Creep): void {



        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚩');
        }

        if(!creep.memory.hitWaypointFlag && creep.pos.inRangeTo(Game.flags.wayPointFlag.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
            creep.memory.hitWaypointFlag = true;
        }else if(!creep.memory.hitWaypointFlag && Game.flags.wayPointFlag.pos !== creep.pos) {

            MovementUtils.goToFlag(creep,Game.flags.wayPointFlag);

            return;
        }

        creep.memory.hitWaypointFlag2 = undefined;
        if(!creep.memory.hitWaypointFlag2 && creep.pos.inRangeTo(Game.flags.wayPointFlag2.pos.x,Game.flags.wayPointFlag.pos.y,2)) {
            creep.memory.hitWaypointFlag2 = true;
        }else if(!creep.memory.hitWaypointFlag2 && Game.flags.wayPointFlag2.pos !== creep.pos) {

            MovementUtils.goToFlag(creep,Game.flags.wayPointFlag2);

            return;
        }

        console.log(AutoSpawn.nextClaimFlag.name);
        if(AutoSpawn.nextClaimFlag.room !== creep.room) {
            MovementUtils.goToFlag(creep,AutoSpawn.nextClaimFlag)
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
            }else
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
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

