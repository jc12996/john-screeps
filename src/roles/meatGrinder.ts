import { MovementUtils } from "utils/MovementUtils";
import { Attacker } from "./attacker";

export class MeatGrinder {
    public static run(creep: Creep): void {

            creep.say('🍖');

            if(Game.flags?.attackFlag && Game.flags?.attackFlag.room !== creep.room) {

                MovementUtils.goToAttackFlag(creep)
                return;
            } else if(Game.flags?.rallyFlag && Game.flags?.rallyFlag.room !== creep.room) {

                MovementUtils.goToRally(creep)
                return;
            }


            var hostileActiveTowers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                filter: (tower) => {
                    return tower.structureType == STRUCTURE_TOWER && tower.store[RESOURCE_ENERGY] != 0
                }
            });

            const nearestExit = creep.pos.findClosestByPath(FIND_EXIT);

            if(hostileActiveTowers.length > 0 && nearestExit) {
               creep.moveTo(nearestExit);
               return;
            } else {
                Attacker.run(creep);
            }
        }
    }
