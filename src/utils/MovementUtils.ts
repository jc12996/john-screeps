import { AutoSpawn } from "autospawn";
import { SpawnUtils } from "./SpawnUtils";

export class MovementUtils {

    private static DIRECTIONS_ARRAY = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    public static randomDirectionSelector(): DirectionConstant {
        return MovementUtils.DIRECTIONS_ARRAY[Math.floor(Math.random() * MovementUtils.DIRECTIONS_ARRAY.length)];
    }

    public static nearestExit(creep: Creep): RoomPosition {
        const exits = creep.room.find(FIND_EXIT)
        return exits[0];

    }

    public static goToAttackFlag(creep: Creep): void {

        this.goToFlag(creep,Game.flags.attackFlag)


    }

    public static goToFlag(creep: Creep, flag:Flag | Creep): void {


            var friendlyRamparts = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (site) => {
                    return (site.structureType == STRUCTURE_RAMPART && !site.isPublic && site.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(site.owner))
                }
            });

            if(friendlyRamparts && !friendlyRamparts.pos.isNearTo(creep.pos.x,creep.pos.y) && !creep.memory?.friendRampartEntered) {
                creep.memory.friendRampartEntered = true
                creep.moveTo(friendlyRamparts);
            } else {
                creep.moveTo(flag);
            }


    }

    public static goToRally(creep: Creep): void {

        this.goToFlag(creep,Game.flags.rallyFlag)

    }

    public static defaultArmyMovement(creep: Creep, flag: Flag | Creep | undefined):void {

        if(flag) {
            MovementUtils.goToFlag(creep,flag)
        }else if(Game?.flags?.attackFlag) {
            MovementUtils.goToAttackFlag(creep);
        } else if(Game?.flags?.rallyFlag) {
            MovementUtils.goToRally(creep);
        } else {
            creep.move(MovementUtils.randomDirectionSelector())
        }
    }

}
