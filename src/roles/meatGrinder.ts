import { MovementUtils } from "utils/MovementUtils";
import { Attacker } from "./attacker";
import { SpawnUtils } from "utils/SpawnUtils";

export class MeatGrinder {
    public static run(creep: Creep): void {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say('🍖');
            }

            const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
            if(!canProceed){
                return;
            }

            if(Game.flags?.preMeatFlag){
                MovementUtils.goToFlag(creep,Game.flags?.preMeatFlag);
                return;
            }

            if(creep.hits < creep.hitsMax && Game.flags?.healFlag){
                MovementUtils.goToFlag(creep,Game.flags?.healFlag);
                return;
            }

            if(Game.flags?.meatFlag && !Game.flags?.attackFlag) {
                MovementUtils.goToFlag(creep,Game.flags?.meatFlag)
                return;
            }
            // if(Game.flags?.attackFlag && Game.flags?.attackFlag.room !== creep.room) {

            //     MovementUtils.goToAttackFlag(creep)
            //     return;
            // } else if(Game.flags?.meatFlag && !Game.flags?.attackFlag) {

            //     MovementUtils.goToFlag(creep,Game.flags?.meatFlag)
            //     return;
            // } else if(Game.flags?.rallyFlag && Game.flags?.rallyFlag.room !== creep.room) {

            //     MovementUtils.goToRally(creep)
            //     return;
            // }


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
