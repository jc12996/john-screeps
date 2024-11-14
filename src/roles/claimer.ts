import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";


export class Claimer {



    public static run(creep: Creep): void {



        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚩');
        }


        if(creep.memory.role === 'attackClaimer') {
            const mineFlags = _.filter(Game.flags, (flag) => flag.room && flag.name && flag.name.includes('MineFlag') && (
                !flag.room?.controller?.reservation
                || (flag.room === creep.room && flag.room.controller.pos.findInRange(FIND_CREEPS,1, {
                    filter: (claimCreep) => {
                        return claimCreep.memory && claimCreep.memory?.building === true && claimCreep.memory.role === 'attackClaimer'
                    }
                }).length === 0)
                || (flag.room === creep.room && flag.room.controller.pos.findInRange(FIND_CREEPS,1, {
                    filter: (claimCreep) => {
                        return claimCreep.memory && claimCreep.memory?.building === true && claimCreep.memory.role === 'attackClaimer' && claimCreep.ticksToLive && claimCreep.ticksToLive < 100
                    }
                }).length >= 1)
                || (flag.room === creep.room && flag.room.controller.reservation.ticksToEnd < 1000)
            ));

            if(creep.memory.building && creep.room?.controller) {
                creep.reserveController(creep.room?.controller);
                return;
            }
            if(mineFlags[0]) {
                const mineRoom = mineFlags[0].room;
                if(mineRoom?.controller) {
                    const reservationCode = creep.reserveController(mineRoom?.controller);
                    if(reservationCode == OK) {
                        creep.memory.building = true;
                    }
                    if(creep.signController(mineRoom.controller, "Mine mine mine!") == ERR_NOT_IN_RANGE) {
                        creep.moveTo(mineRoom.controller);
                    }else if(reservationCode == ERR_NOT_IN_RANGE){
                        creep.moveTo(mineRoom.controller);
                    }
                }
            }
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
                    return object.structureType === STRUCTURE_CONTROLLER && object.owner?.username !== 'Invader'
                }
            });




            if(!creep.pos.inRangeTo(creep.room.controller.pos.x,creep.room.controller.pos.y,1)) {
                if(creep.room.controller) {
                    if(creep.signController(creep.room.controller, "Mine mine mine! -- X") == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                } else {
                    creep.moveTo(creep.room.controller);
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

