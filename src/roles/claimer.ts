import { AutoSpawn } from "autospawn";
import { Labs } from "labs";
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
        // if (!creep.memory.isBoosted) {
        //     const canContinue = Labs.boostCreep(creep);
        //     if (!canContinue) {
        //         return;
        //     }
        // }

        if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("🏴");
        }

        // Handle multiple MineFlags
        const mineFlags = _.filter(Game.flags, (flag) => flag.name.startsWith(creep.memory.firstSpawnCoords + 'MineFlag'));

        // Assign claimers to flags if not already assigned
        if (!creep.memory.assignedFlag) {
            for (const mineFlag of mineFlags) {
                const assignedClaimers = _.filter(Game.creeps, (claimer) => claimer.memory.role === 'claimer' && claimer.memory.assignedFlag === mineFlag.name);
                const neededClaimers = mineFlag.memory?.numberOfNeededClaimers || 1; // Default to 1 if not set

                if (assignedClaimers.length < neededClaimers) {
                    creep.memory.assignedFlag = mineFlag.name;
                    break;
                }
            }
        }

        // If assigned, go to the assigned flag
        if (creep.memory.assignedFlag) {
            const assignedFlag = Game.flags[creep.memory.assignedFlag];
            if (assignedFlag) {
                // Only move if not already in the target room
                if (creep.room.name !== assignedFlag.pos.roomName) {
                    MovementUtils.goToFlag(creep, assignedFlag);
                    return;
                }

                this.claimController(creep, assignedFlag);
            }
        }
    }

    private static claimController(creep: Creep, mineFlag: Flag) {
        if (creep.room.controller && !creep.room.controller.my) {
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else if (creep.room.controller && creep.room.controller.my) {
            // If already claimed, remove the flag
            mineFlag.remove();
        }
    }

}

