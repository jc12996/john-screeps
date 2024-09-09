import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";

export class Miner {



    public static run(creep: Creep): void {



        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0)) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }

        if(!!!creep.memory?.firstSpawnCoords) {
            return;
        }


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }

        if(!creep.memory.carrying) {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏ 🔄");
            }

            const mineFlag = Game.flags[creep.memory.firstSpawnCoords + 'MineFlag'];
            if(!!!mineFlag) {
                return;
            }

            if(!creep.pos.isNearTo(mineFlag)) {
                MovementUtils.goToFlag(creep,mineFlag);
                return;
            }



            let targetSource = mineFlag.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            if(targetSource) {
                const mineResult = creep.harvest(targetSource);
                if(mineResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSource);
                }
            }



        }else {
            const firstRoom = Game.rooms[creep.memory.firstSpawnCoords]
            const roomStructures = firstRoom.find(FIND_MY_SPAWNS)

            if(creep.room !== firstRoom) {
                creep.moveTo(roomStructures[0]);
                return;
            }

            const nearestAvailableWorkingRoleCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter:  (creep) => {
                    return (
                       ( creep.memory.role === 'upgrader') && creep.store.getFreeCapacity() > 0)
                }
            });

            const largeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                       structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                    ) &&
                        structure.store[RESOURCE_ENERGY] > 10000;
                }
            });
            if(largeStorage) {

                Carrier.run(creep,true);

            } else {
                Carrier.run(creep);
            }





        }
    }

}

