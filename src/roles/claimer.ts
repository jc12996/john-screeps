import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";


export class Claimer {


    private static choosePriorityReservationFlag(creep: Creep): Flag | null {
        // Filter flags that meet the specific conditions
        const validFlags = _.filter(Game.flags, (flag) => {
            // Reset flag assignment status
            flag.memory.isassigned = undefined;

            // Check for specific conditions to assign the flag
            if (
                flag?.room?.controller?.pos.findInRange(FIND_CREEPS, 1, {
                    filter: (claimCreep) => {
                        return (
                            claimCreep.memory &&
                            claimCreep.memory?.building === true &&
                            claimCreep.memory.role === 'attackClaimer'
                        );
                    },
                }).length &&
                creep.ticksToLive &&
                creep.ticksToLive > 100
            ) {
                flag.memory.isassigned = true;
            }

            const mineRoomName = flag.name.split('MineFlag')[0];
            const mineRoom = Game.rooms[mineRoomName];

            return (
                flag.room &&
                flag.name &&
                flag.memory.isassigned === undefined &&
                flag.name.includes('MineFlag') &&
                mineRoom?.controller && mineRoom?.controller?.level >= 3 &&
                (!flag.room?.controller?.reservation ||
                    flag.room.controller.pos.findInRange(FIND_CREEPS, 1, {
                        filter: (claimCreep) => {
                            return (
                                claimCreep.memory &&
                                claimCreep.memory?.building === true &&
                                claimCreep.memory.role === 'attackClaimer'
                            );
                        },
                    }).length < 3)
            );
        });

        // If no valid flags, return closest mine flag or null
        if (validFlags.length === 0) {
            const mineFlags = _.filter(Game.flags, flag => flag.name.includes('MineFlag'));
            if (mineFlags.length === 0) return null;
            
            return mineFlags.reduce((closest, flag) => {
                const rangeToFlag = creep.pos.getRangeTo(flag.pos);
                return !closest || rangeToFlag < creep.pos.getRangeTo(closest.pos) ? flag : closest;
            });
        }

        // Sort the valid flags by proximity to the creep
        const closestFlag = validFlags.reduce((closest, flag) => {
            const rangeToFlag = creep.pos.getRangeTo(flag.pos);
            return rangeToFlag < creep.pos.getRangeTo(closest.pos) ? flag : closest;
        });

        return closestFlag;
    }

    public static run(creep: Creep): void {



        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🚩');
        }



        if(creep.memory.role === 'attackClaimer') {


            if(creep.memory.building && creep.room?.controller) {
                creep.say('🚩' + creep.room?.controller.room.name)
                creep.reserveController(creep.room?.controller);
                return;
            }


            if(!creep.memory.assignedMineFlag) {
                return;
            }
    
            const chosenDestinationFlag = Game.flags[creep.memory.assignedMineFlag] as Flag;
    
            if(!!!chosenDestinationFlag) {
                return;
            }

            if(chosenDestinationFlag) {
                const mineRoom = chosenDestinationFlag.room;
                if(mineRoom?.controller) {
                    const reservationCode = creep.reserveController(mineRoom?.controller);
                    if(reservationCode == OK) {
                        creep.say('🚩'+mineRoom.name)
                        creep.memory.building = true;
                    }
                    if(creep.signController(mineRoom.controller, "Mine mine mine!") == ERR_NOT_IN_RANGE) {
                        creep.say('🚩'+mineRoom.name)
                        creep.moveTo(mineRoom.controller);
                    }else if(reservationCode == ERR_NOT_IN_RANGE){
                        creep.say('🚩'+mineRoom.name)
                        creep.moveTo(mineRoom.controller);
                    } else {
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

